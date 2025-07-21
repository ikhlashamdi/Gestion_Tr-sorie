import CaisseList from '../components/Caisse/CaisseList.jsx'
import Layout from '../components/common/Layout'


const Caisse = () => {
    return (
        <Layout>
            <CaisseList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Caisse
