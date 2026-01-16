// Pyodide Web Worker for Python execution
// Runs in a separate thread to prevent blocking the UI

importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide = null;
let loadingPromise = null;

// Initialize Pyodide
async function initPyodide() {
  if (loadingPromise) return loadingPromise;
  
  loadingPromise = (async () => {
    console.log("[Pyodide Worker] Initializing Pyodide...");
    
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
    });

    // Pre-load commonly used packages
    await pyodide.loadPackage(["numpy", "micropip"]);
    
    // Install additional packages via micropip
    const micropip = pyodide.pyimport("micropip");
    await micropip.install(["sympy", "matplotlib"]);

    // Set up matplotlib for non-interactive backend
    await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64

def _get_plot_as_base64():
    """Helper to convert current matplotlib figure to base64"""
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='white')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close('all')
    return img_base64
    `);

    console.log("[Pyodide Worker] Pyodide initialized successfully");
    return pyodide;
  })();

  return loadingPromise;
}

// Execute Python code
async function executeCode(code, options = {}) {
  const { timeout = 30000, packages = [] } = options;
  
  try {
    if (!pyodide) {
      await initPyodide();
    }

    // Install any additional packages
    if (packages.length > 0) {
      const micropip = pyodide.pyimport("micropip");
      for (const pkg of packages) {
        try {
          await micropip.install(pkg);
        } catch (e) {
          console.warn(`[Pyodide Worker] Failed to install ${pkg}:`, e);
        }
      }
    }

    // Capture stdout and stderr
    let stdout = "";
    let stderr = "";

    pyodide.setStdout({
      batched: (s) => {
        stdout += s + "\n";
      },
    });

    pyodide.setStderr({
      batched: (s) => {
        stderr += s + "\n";
      },
    });

    // Execute with timeout
    const startTime = performance.now();
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Execution timed out (30s limit)")), timeout);
    });

    const executionPromise = pyodide.runPythonAsync(code);
    
    const result = await Promise.race([executionPromise, timeoutPromise]);
    
    const executionTime = performance.now() - startTime;

    // Check if a plot was created
    let plotBase64 = null;
    try {
      // Check if there's an active figure
      const hasPlot = await pyodide.runPythonAsync(`
len(plt.get_fignums()) > 0
      `);
      
      if (hasPlot) {
        plotBase64 = await pyodide.runPythonAsync("_get_plot_as_base64()");
      }
    } catch (e) {
      // No plot or error getting plot
    }

    return {
      success: true,
      output: stdout.trim(),
      error: stderr.trim() || null,
      result: result?.toString() || null,
      plot: plotBase64,
      executionTime: Math.round(executionTime),
    };

  } catch (error) {
    return {
      success: false,
      output: "",
      error: error.message || "Execution failed",
      result: null,
      plot: null,
      executionTime: 0,
    };
  }
}

// Load a specific package
async function loadPackage(packageName) {
  try {
    if (!pyodide) {
      await initPyodide();
    }
    
    const micropip = pyodide.pyimport("micropip");
    await micropip.install(packageName);
    
    return { success: true, package: packageName };
  } catch (error) {
    return { success: false, package: packageName, error: error.message };
  }
}

// Message handler
self.onmessage = async (event) => {
  const { id, type, payload } = event.data;

  try {
    let response;

    switch (type) {
      case "init":
        await initPyodide();
        response = { success: true, message: "Pyodide initialized" };
        break;

      case "execute":
        response = await executeCode(payload.code, payload.options);
        break;

      case "loadPackage":
        response = await loadPackage(payload.packageName);
        break;

      default:
        response = { success: false, error: `Unknown message type: ${type}` };
    }

    self.postMessage({ id, ...response });

  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message || "Worker error",
    });
  }
};

// Pre-initialize on worker load
initPyodide().catch((e) => {
  console.error("[Pyodide Worker] Failed to pre-initialize:", e);
});
