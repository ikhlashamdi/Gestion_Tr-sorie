import Layout from '../components/common/Layout.jsx'
import ComptesList from '../components/compte/ComptesList.jsx'

const Home = () => {
    return (
        <Layout>
            <ComptesList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Home