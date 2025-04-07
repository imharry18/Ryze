import './officialButton.css'
function button({text}){
    return(
        <>
            <div id="buttonBox">
                <div id="buttonText">{text}</div>
            </div>
        </>
    )
}

export default button