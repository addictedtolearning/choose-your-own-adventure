import styles from './Spinner.module.css'

export default function Spinner(props: any) {
    var className = '';
    className += styles.spinner + ' ';
    if(props.loading) {
        className += styles.loading + ' ';
    }

    return <div
        className={className}>
    </div>
}