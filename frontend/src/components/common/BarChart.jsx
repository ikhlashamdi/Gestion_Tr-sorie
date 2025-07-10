import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store/appStore';

const data = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
];

const getSidebarWidth = (dopen) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
        return dopen ? window.innerWidth : 64;
    }
    if (dopen) {
        const calc = Math.max(window.innerWidth * 0.2, 175);
        return Math.min(calc, 300);
    }
    return 64;
};

const BarChartLayout = ({ className = "" }) => {
    // Use CSS variables for colors
    const primaryLight = 'var(--primary-light)';
    const secondaryLight = 'var(--secondary-light)';
    const accentLight = 'var(--accent-light)';
    const accentDark = 'var(--accent-dark)';
    const gray200 = 'var(--gray-700)'; // darker gray for grid
    const gray300 = 'var(--gray-600)'; // darker gray for axis

    return (
        <div className={`w-full flex justify-center overflow-x-auto px-2 ${className}`}>
            <div className="w-full max-w-[1200px]">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke={gray200} />
                        <XAxis dataKey="name" stroke={gray200} />
                        <YAxis stroke={gray300} />
                        <Tooltip
                            contentStyle={{ background: 'var(--gray-100)', color: 'var(--gray-300)' }}
                            cursor={{ fill: 'var(--gray-200)' }}
                        />
                        <Legend />
                        <Bar
                            dataKey="pv"
                            fill={primaryLight}
                            activeBar={<Rectangle fill={accentDark} stroke={primaryLight} />}
                        />
                        <Bar
                            dataKey="uv"
                            fill={secondaryLight}
                            activeBar={<Rectangle fill={accentLight} stroke={secondaryLight} />}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BarChartLayout;