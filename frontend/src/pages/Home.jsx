import Layout from '../components/common/Layout.jsx'
import BarChartLayout from '../components/common/BarChart.jsx'

const Home = () => {
    return (
        <Layout>
            <BarChartLayout className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Home