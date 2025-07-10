import Layout from '../components/common/Layout'
import JournalList from '../components/journal/JournalList'

const Journaux = () => {
    return (
        <Layout>
            <JournalList className='mt-[var(--nav-height)]' />
        </Layout>
    )
}

export default Journaux