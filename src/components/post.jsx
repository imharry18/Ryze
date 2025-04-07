import './post.css'
import {Minimize2, Heart, ExternalLink, SmilePlus, SendHorizontal} from 'lucide-react'
function post(){
    return(
        <>
            <div id='postSection'>
                <div id="topPanel">
                    <div id='topPanelDp'><img src="./logo.png" alt="" /></div>
                    <div>ryze</div>
                    <div id='dateTime'><div>05/04/2025</div><div>09:57 am</div></div>
                    <div id='panelClose'><Minimize2 id='panelCloseIcon'/></div>
                </div>
                <div id='postMedia'>
                    <div id='postImgVid'><img src="./logo.png" alt="" /></div>
                    <div id='postComment'>
                        <div id='postCaption'><div><b>ryze</b></div><div style={{marginLeft: "5px", marginRight: "5px"}}>Connect, chat, and confess anonymously. Follow friends, share secrets, and vibe with your college community like never before. It's your space to speak freely. Ryze up, express loud!"Want a more funny, serious, or edgy tone?</div></div>
                        <div id='postComments'>
                        <div id='commentWriting'><input type="text" name="" placeholder='What do you think' id="" /><button type='submit' id='commentSubmission'><SendHorizontal /></button></div>
                            <div id='comment'><div id='commentLike'><span id='commentUsername'>harish_1.8</span><span><Heart size={17}/>43</span></div><span id='commentData'>Hey Guys! I created this App</span></div>
                            <div id='comment'><div id='commentLike'><span id='commentUsername'>jordan_.rockstar</span><span><Heart size={17}/>13</span></div><span id='commentData'>Hey Buddy I can believe that you can create this type of App, can you please tell me with which development you build this App. I also have a great Idea</span></div>
                            <div id='comment'><div id='commentLike'><span id='commentUsername'>pixel.panda</span><span><Heart size={17}/>8</span></div><span id='commentData'>Bro this is next level stuff! How long did it take you to build this? I'm seriously impressed 🔥</span></div>
                            <div id='comment'><div id='commentLike'><span id='commentUsername'>code.crusader</span><span><Heart size={17}/>21</span></div><span id='commentData'>This app looks so clean! Did you use Flutter or React Native? I’ve been thinking of building something similar!</span></div>
                            <div id='comment'><div id='commentLike'><span id='commentUsername'>techie.tea</span><span><Heart size={17}/>15</span></div><span id='commentData'>This is actually amazing! Can't wait to try it out with my friends. UI is smooth af 💯</span></div>
                        </div>
                        <div id='LikeShare'>
                            <div><Heart size={25} /></div>
                            <div><ExternalLink  size={25}/></div>
                            <div><SmilePlus   size={25}/></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default post