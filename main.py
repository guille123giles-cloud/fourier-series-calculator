from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import numpy as np
import sympy as sp
from scipy.integrate import quad

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FourierRequest(BaseModel):
    funcion: str 
    armonicos: int
    L: float = 1.0 

@app.post("/calcular")
def calcular_fourier(req: FourierRequest):
    x_sym = sp.Symbol('x')
    try:
        f_sym = sp.sympify(req.funcion)
        f_num = sp.lambdify(x_sym, f_sym, "numpy")
        def f(x_val):
            if isinstance(x_val, np.ndarray):
                return np.array([f_num(val) for val in x_val])
            return f_num(x_val)
    except Exception as e:
        return {"error": f"Error en la función: {str(e)}"}

    L, N = req.L, req.armonicos
    a0_int, _ = quad(lambda x: f(x), -L, L, limit=100)
    a0 = (1/L) * a0_int

    coeficientes = []
    for n in range(1, N + 1):
        an_int, _ = quad(lambda x: f(x) * np.cos(n * np.pi * x / L), -L, L, limit=100)
        bn_int, _ = quad(lambda x: f(x) * np.sin(n * np.pi * x / L), -L, L, limit=100)
        coeficientes.append({"n": n, "an": round((1/L) * an_int, 5), "bn": round((1/L) * bn_int, 5)})

    x_vals = np.linspace(-2, 2, 400)
    y_orig = f( ((x_vals + L) % (2 * L)) - L )
    y_aprox = np.full_like(x_vals, a0 / 2)

    for c in coeficientes:
        y_aprox += c["an"] * np.cos(c["n"] * np.pi * x_vals / L) + c["bn"] * np.sin(c["n"] * np.pi * x_vals / L)

    return {
        "a0": round(a0, 5),
        "coeficientes": coeficientes,
        "grafica": {"x": x_vals.tolist(), "y_orig": y_orig.tolist(), "y_aprox": y_aprox.tolist()}
    }

# Servir Frontend
@app.get("/")
def read_index():
    return FileResponse('index.html')

app.mount("/", StaticFiles(directory="."), name="static")
