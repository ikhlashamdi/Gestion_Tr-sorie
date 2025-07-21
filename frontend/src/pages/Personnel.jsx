import Layout from '../components/common/Layout'
import PersonnelList from '../components/Personnel/PersonnelList'

const Personnel = () => {
    return (
        <Layout>
            <PersonnelList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Personnel
