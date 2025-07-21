import Layout from '../components/common/Layout'
import VehiculeList from '../components/Vehicule/VehiculeList'

const VehiculePage = () => {
    return (
        <Layout>
            <VehiculeList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default VehiculePage