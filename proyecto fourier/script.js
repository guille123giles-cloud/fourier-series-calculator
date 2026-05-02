let coeficientesActuales = [];

// Referencias a los elementos del DOM
const inputFuncion = document.getElementById('funcion');
const sliderArmonicos = document.getElementById('armonicos');
const badgeN = document.getElementById('n_val');
const btnExportar = document.getElementById('btnExportar');
const loader = document.getElementById('loader');

// Eventos
inputFuncion.addEventListener('change', calcular);
sliderArmonicos.addEventListener('input', actualizarSliderUI);
sliderArmonicos.addEventListener('change', calcular);
btnExportar.addEventListener('click', descargarCSV);

// Al cargar la página, ejecutar un primer cálculo
window.addEventListener('DOMContentLoaded', calcular);

// Función para actualizar solo el texto del número (rápido, sin calcular)
function actualizarSliderUI() {
    badgeN.innerText = sliderArmonicos.value;
}

// Función principal que se comunica con Python
async function calcular() {
    loader.style.display = 'block';
    
    const func = inputFuncion.value;
    const n = sliderArmonicos.value;

    try {
        const response = await fetch("http://localhost:8000/calcular", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ funcion: func, armonicos: parseInt(n), L: 1.0 })
        });

        const data = await response.json();
        
        if(data.error) { 
            alert(data.error); 
            loader.style.display = 'none';
            return; 
        }

        // Actualizar Tabla y Textos
        document.getElementById('a0_val').innerText = data.a0;
        coeficientesActuales = data.coeficientes;
        
        let html = "";
        data.coeficientes.forEach(c => {
            html += `<tr><td>${c.n}</td><td>${c.an}</td><td>${c.bn}</td></tr>`;
        });
        document.getElementById('tabla_body').innerHTML = html;

        // Renderizar el Gráfico
        const trace1 = { 
            x: data.grafica.x, y: data.grafica.y_orig, 
            mode: 'lines', name: 'f(x) Periódica', 
            line: {color: '#1e293b', width: 3, dash: 'solid'} 
        };
        const trace2 = { 
            x: data.grafica.x, y: data.grafica.y_aprox, 
            mode: 'lines', name: `Aproximación (N=${n})`, 
            line: {color: '#2563eb', width: 2} 
        };
        
        const layout = { 
            title: { text: 'Convergencia de la Serie en el intervalo [-2, 2]', font: {family: 'Inter', size: 18} },
            plot_bgcolor: '#f8fafc',
            paper_bgcolor: 'white',
            xaxis: { title: 'x', gridcolor: '#e2e8f0', zerolinecolor: '#94a3b8' },
            yaxis: { title: 'f(x)', gridcolor: '#e2e8f0', zerolinecolor: '#94a3b8' },
            margin: { l: 50, r: 30, t: 60, b: 50 },
            legend: { orientation: 'h', y: -0.15 }
        };
        
        const config = { responsive: true, displaylogo: false };
        Plotly.newPlot('grafico', [trace1, trace2], layout, config);

    } catch (error) {
        console.error("Error conectando al backend:", error);
        alert("Asegúrate de que el servidor de Python (FastAPI) esté encendido.");
    } finally {
        loader.style.display = 'none';
    }
}

function descargarCSV() {
    if(coeficientesActuales.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,n,an,bn\n";
    coeficientesActuales.forEach(row => {
        csvContent += `${row.n},${row.an},${row.bn}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coeficientes_N${sliderArmonicos.value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}