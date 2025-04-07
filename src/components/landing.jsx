import './landing.css'
import Sidepanel from './sidePanel'
import User from './userList'
import Body from './body'
import Update from './update'

function landing(){
    return(
        <>
            <div id="landingPagePanels">
                
                <div id="sidePanel"><Sidepanel /></div>
                <div id="mainPanel"><Body /></div>
                <div id='UpdatePanel'><Upda                         te /></div>

            </div>
        </>
    )
}
export default landing