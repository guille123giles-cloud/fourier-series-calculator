# Calculadora de Series de Fourier

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Plotly](https://img.shields.io/badge/Plotly-3F4F75?style=for-the-badge&logo=plotly&logoColor=white)

Una aplicación web full-stack diseñada para calcular, analizar y visualizar la convergencia de Series de Fourier para funciones continuas y definidas por partes. 

Este proyecto fue desarrollado como parte de la cátedra de **Análisis Numérico** de la carrera **Ingeniería en Sistemas de Información** en la **Universidad Tecnológica Nacional (UTN) - FRLP**.

## Características

- **Motor Matemático Simbólico:** Interpreta funciones por partes y de valor absoluto mediante `SymPy`.
- **Integración Numérica:** Calcula los coeficientes exactos $a_0$, $a_n$ y $b_n$ de Euler-Fourier utilizando los algoritmos QUAD de `SciPy`.
- **Visualización Interactiva:** Gráficas dinámicas de la función periódica original comparada con la aproximación de la serie usando `Plotly.js`.
- **Convergencia en Tiempo Real:** Control deslizante ajustable para cambiar dinámicamente el número de armónicos ($N$) y observar el fenómeno de Gibbs.
- **Exportación de Datos:** Funcionalidad integrada para descargar los coeficientes calculados en formato CSV.

## Arquitectura

El proyecto separa estrictamente el procesamiento matemático de la capa de presentación:
- **Backend (Python):** Una API REST construida con FastAPI que maneja el procesamiento matemático pesado de forma asíncrona.
- **Frontend (HTML/CSS/JS):** Una interfaz responsiva estilo *dashboard* que no requiere compilación previa (zero build-step), lo que la hace extremadamente ligera y rápida.

## Cómo ejecutarlo localmente

### Requisitos previos
Asegúrate de tener Python instalado en tu sistema. Luego, instala las dependencias del backend:
```bash
pip install -r requirements.txt
