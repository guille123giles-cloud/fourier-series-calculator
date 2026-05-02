from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import sympy as sp
from scipy.integrate import quad
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FourierRequest(BaseModel):
    funcion: str  # Ejemplo: "Piecewise((1, (x>=0) & (x<=1)), (-1, (x>-1) & (x<=0)))"
    armonicos: int
    L: float = 1.0 # El periodo en el ejercicio 4 es [-1, 1], así que L=1

@app.post("/calcular")
def calcular_fourier(req: FourierRequest):
    x_sym = sp.Symbol('x')
    
    try:
        # SymPy permite interpretar funciones definidas por partes (Piecewise)
        # y funciones absolutas (Abs)
        f_sym = sp.sympify(req.funcion)
        f_num = sp.lambdify(x_sym, f_sym, "numpy")
        
        def f(x_val):
            # Usamos np.piecewise o vectorizamos la función para que funcione con arrays de Numpy
            if isinstance(x_val, np.ndarray):
                return np.array([f_num(val) for val in x_val])
            return f_num(x_val)
            
    except Exception as e:
        return {"error": f"Error al interpretar la función: {str(e)}"}

    L = req.L
    N = req.armonicos

    # 1. Cálculo de a0
    a0_int, _ = quad(lambda x: f(x), -L, L, limit=100)
    a0 = (1/L) * a0_int

    # 2. Cálculo de an y bn hasta el armónico N
    coeficientes = []
    for n in range(1, N + 1):
        # La fórmula incluye L. En este caso L=1, por lo que queda n*pi*x
        an_int, _ = quad(lambda x: f(x) * np.cos(n * np.pi * x / L), -L, L, limit=100)
        bn_int, _ = quad(lambda x: f(x) * np.sin(n * np.pi * x / L), -L, L, limit=100)
        
        an = (1/L) * an_int
        bn = (1/L) * bn_int
        coeficientes.append({"n": n, "an": round(an, 5), "bn": round(bn, 5)})

    # 3. Generación de puntos para las gráficas. 
    # El ejercicio pide graficar en el intervalo [-2, 2]
    x_vals = np.linspace(-2, 2, 400)
    
    # IMPORTANTE: Para graficar la función original periódica más allá de [-L, L], 
    # necesitamos crear una versión periódica de f(x).
    def f_periodica(x):
        # Mapea cualquier x al intervalo [-L, L)
        x_mod = ((x + L) % (2 * L)) - L
        return f(x_mod)
        
    y_orig = f_periodica(x_vals)
    y_aprox = np.full_like(x_vals, a0 / 2)

    for coef in coeficientes:
        n = coef["n"]
        y_aprox += coef["an"] * np.cos(n * np.pi * x_vals / L) + coef["bn"] * np.sin(n * np.pi * x_vals / L)

    return {
        "a0": round(a0, 5),
        "coeficientes": coeficientes,
        "grafica": {
            "x": x_vals.tolist(),
            "y_orig": y_orig.tolist(),
            "y_aprox": y_aprox.tolist()
        }
    }