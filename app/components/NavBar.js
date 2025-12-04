import styles from '../../styles/NavBar.module.css' 
import Image from 'next/image'

export default function NavBar(){

    return(
        <div className={styles.nav}>
            <Image src="/images/logo.png" width="80" height="50" alt="Logotipo" className={styles.logo}/>
        </div>
    )



}