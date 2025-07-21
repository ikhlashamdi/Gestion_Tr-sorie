import Layout from '../components/common/Layout'
import FournisseurList from '../components/Fournisseur/fournisseurList'


const Fournisseur = () => {
    return (
        <Layout>
            <FournisseurList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Fournisseur
