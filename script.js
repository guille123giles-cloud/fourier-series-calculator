let coeficientesActuales = [];

const inputFuncion = document.getElementById('funcion');
const sliderArmonicos = document.getElementById('armonicos');
const badgeN = document.getElementById('n_val');
const btnExportar = document.getElementById('btnExportar');
const loader = document.getElementById('loader');

inputFuncion.addEventListener('change', calcular);
sliderArmonicos.addEventListener('input', actualizarSliderUI);
sliderArmonicos.addEventListener('change', calcular);
btnExportar.addEventListener('click', descargarCSV);

window.addEventListener('DOMContentLoaded', calcular);

function actualizarSliderUI() {
    badgeN.innerText = sliderArmonicos.value;
}

async function calcular() {
    loader.style.display = 'block';
    
    const func = inputFuncion.value;
    const n = sliderArmonicos.value;

    try {
        // Usamos ruta relativa para que funcione en el servidor desplegado
        const response = await fetch("/calcular", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ funcion: func, armonicos: parseInt(n), L: 1.0 })
        });

        const data = await response.json();
        
        if(data.error) { 
            alert(data.error); 
            return; 
        }

        document.getElementById('a0_val').innerText = data.a0;
        coeficientesActuales = data.coeficientes;
        
        let html = "";
        data.coeficientes.forEach(c => {
            html += `<tr><td>${c.n}</td><td>${c.an}</td><td>${c.bn}</td></tr>`;
        });
        document.getElementById('tabla_body').innerHTML = html;

        const trace1 = { 
            x: data.grafica.x, y: data.grafica.y_orig, 
            mode: 'lines', name: 'f(x) Periódica', 
            line: {color: '#1e293b', width: 3} 
        };
        const trace2 = { 
            x: data.grafica.x, y: data.grafica.y_aprox, 
            mode: 'lines', name: `Aproximación (N=${n})`, 
            line: {color: '#2563eb', width: 2} 
        };
        
        const layout = { 
            title: 'Convergencia de la Serie en [-2, 2]',
            plot_bgcolor: '#f8fafc',
            xaxis: { title: 'x' },
            yaxis: { title: 'f(x)' },
            legend: { orientation: 'h', y: -0.2 }
        };
        
        Plotly.newPlot('grafico', [trace1, trace2], layout, {responsive: true});

    } catch (error) {
        console.error("Error:", error);
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
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `coeficientes_N${sliderArmonicos.value}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}