
import ClientList from '../components/Client/ClientList.jsx'
import Layout from '../components/common/Layout'


const Client = () => {
    return (
        <Layout>
            <ClientList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Client
