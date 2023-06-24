import styles from './LetterButton.module.css'


export default function LetterButton(props: any) {
    var className = '';
    className += styles.letterButton + ' ';
    if(props.used) {
        className += styles.used + ' ';
    }

    return <button
        onClick={props.onClick}
        disabled={props.used}
        className={className}>
        {props.letter}
    </button>
}