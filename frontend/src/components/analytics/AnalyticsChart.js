import React, { useEffect, useState } from "react";

const AnalyticsChart = ({ data }) => {
    const [ChartComponents, setChartComponents] = useState(null);

    useEffect(() => {
        // Dynamically import chart libraries so app still builds if user hasn't installed them yet
        let cancelled = false;
        const load = async () => {
            try {
                const [{ Line }] = await Promise.all([
                    import("react-chartjs-2"),
                    import("chart.js/auto"),
                ]);
                if (!cancelled) setChartComponents({ Line });
            } catch (err) {
                console.warn("Chart libraries not installed. Install 'chart.js' and 'react-chartjs-2' to see charts.", err);
                setChartComponents(null);
            }
        };
        load();
        return () => (cancelled = true);
    }, []);

    const labels = data.map((d) => d.label);
    const avgPrices = data.map((d) => d.avgPrice);
    const minPrices = data.map((d) => d.minPrice);
    const maxPrices = data.map((d) => d.maxPrice);

    if (!ChartComponents) {
        // Fallback display
        return (
            <div className="analytics-fallback">
                <p className="text-muted">Charts are not available. Install <code>chart.js</code> and <code>react-chartjs-2</code> to enable charts.</p>
                <div className="table-responsive">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Avg</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d) => (
                                <tr key={d.label}>
                                    <td>{d.label}</td>
                                    <td>{d.avgPrice}</td>
                                    <td>{d.minPrice}</td>
                                    <td>{d.maxPrice}</td>
                                    <td>{d.totalQty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    const { Line } = ChartComponents;

    const chartData = {
        labels,
        datasets: [
            {
                label: "Avg Price",
                data: avgPrices,
                borderColor: "#0d6efd",
                backgroundColor: "rgba(13,110,253,0.15)",
                tension: 0.2,
            },
            {
                label: "Min Price",
                data: minPrices,
                borderColor: "#6c757d",
                backgroundColor: "rgba(108,117,125,0.05)",
                tension: 0.2,
            },
            {
                label: "Max Price",
                data: maxPrices,
                borderColor: "#198754",
                backgroundColor: "rgba(25,135,84,0.05)",
                tension: 0.2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
        },
    };

    return (
        <div style={{ minHeight: 320 }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default AnalyticsChart;