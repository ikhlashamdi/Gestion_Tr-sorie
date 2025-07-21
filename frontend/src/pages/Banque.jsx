import BanqueList from '../components/Banque/BanqueList'
import Layout from '../components/common/Layout'

const Banque = () => {
    return (
        <Layout>
            <BanqueList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Banque
