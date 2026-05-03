let coeficientesActuales = [];

const inputFuncion = document.getElementById('funcion');
const sliderArmonicos = document.getElementById('armonicos');
const badgeN = document.getElementById('n_val');
const btnExportar = document.getElementById('btnExportar');
const loader = document.getElementById('loader');

inputFuncion.addEventListener('change', calcular);
sliderArmonicos.addEventListener('input', () => badgeN.innerText = sliderArmonicos.value);
sliderArmonicos.addEventListener('change', calcular);
btnExportar.addEventListener('click', descargarCSV);

window.addEventListener('DOMContentLoaded', calcular);
window.onresize = () => Plotly.Plots.resize('grafico');

async function calcular() {
    loader.style.display = 'block';
    try {
        const response = await fetch("/calcular", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ funcion: inputFuncion.value, armonicos: parseInt(sliderArmonicos.value), L: 1.0 })
        });

        const data = await response.json();
        if(data.error) return alert(data.error);

        document.getElementById('a0_val').innerText = data.a0;
        coeficientesActuales = data.coeficientes;
        document.getElementById('tabla_body').innerHTML = data.coeficientes.map(c => `<tr><td>${c.n}</td><td>${c.an}</td><td>${c.bn}</td></tr>`).join('');

        const traces = [
            { x: data.grafica.x, y: data.grafica.y_orig, mode: 'lines', name: 'f(x) Original', line: {color: '#1e293b', width: 3} },
            { x: data.grafica.x, y: data.grafica.y_aprox, mode: 'lines', name: 'Serie Fourier', line: {color: '#2563eb', width: 2} }
        ];

        Plotly.newPlot('grafico', traces, {
            title: 'Convergencia',
            margin: { l: 40, r: 20, t: 40, b: 40 },
            legend: { orientation: 'h', y: -0.2 }
        }, { responsive: true, displaylogo: false });

    } catch (e) { console.error(e); } finally { loader.style.display = 'none'; }
}

function descargarCSV() {
    let csv = "data:text/csv;charset=utf-8,n,an,bn\n" + coeficientesActuales.map(r => `${r.n},${r.an},${r.bn}`).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", "fourier.csv");
    link.click();
}
