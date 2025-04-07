import './postCard.css'
import {Bookmark, Heart, MessageCircle, Forward, Dot} from 'lucide-react'
function postCard(){
  return(
    <>
      <div id="backgroundCard">
          <div id='postCardMedia'><img src="./new.jpg" alt="" /></div>
          <div id='postCardData'>
            <div id='postCardNameDPBookmark'>
              <div id='postCardDP'><img src="./new.jpg" alt="" /></div>
              <div id='postCardName'> 
                <div id='name&Username'><div>Sarah Johnson</div><div>@sarahjohnson</div></div>
              </div>
              <div id='bookmark'><Bookmark /></div>
            </div>  
            <div id='postCardCaption'>
              <p>Enjoying a beautiful day at the beach! The waves were perfect and the sunset was absolutely breathtaking. #beachday #sunset #summer</p>

            </div>  
            <div id='postCardLikeShareComment'>
              <div id='postCardLikes' className='postCardLikeShare'><Heart /><p>124</p></div>
              <div id='postCardComments' className='postCardLikeShare'><MessageCircle /><p>4</p></div>
              <div id='postCardShare' className='postCardLikeShare'><Forward /><p>Share</p></div>
            </div>
            <div id='postCardCommentSection'>
              <div id='postCardCommentsBox'>
                <span id='commentSectionTop'><span><Dot /></span>Comments</span>
                <div className='postCardCommentData'><div id='commentDp'><img src="./harish_1.8.jpg" alt="" /></div><div id='commentPostCard'><p>harish_1.8</p><p>Looks amazing! Which beah is this?</p></div></div>
                <div className='postCardCommentData'><div id='commentDp'><img src="./harish_1.8.jpg" alt="" /></div><div id='commentPostCard'><p>stanzin_vision</p><p>The sunset vibes are unreal!</p></div></div>
                <div className='postCardCommentData'><div id='commentDp'><img src="./harish_1.8.jpg" alt="" /></div><div id='commentPostCard'><p>its.me.raj</p><p>Brooo this looks like paradise!</p></div></div>
                <div className='postCardCommentData'><div id='commentDp'><img src="./harish_1.8.jpg" alt="" /></div><div id='commentPostCard'><p>neha_dreamer</p><p>Wish I was there too 😍</p></div></div>
                <div className='postCardCommentData'><div id='commentDp'><img src="./harish_1.8.jpg" alt="" /></div><div id='commentPostCard'><p>coder_amit</p><p>Clicked on DSLR or phone?</p></div></div>
                <div className='postCardCommentData'><div id='commentDp'><img src="./harish_1.8.jpg" alt="" /></div><div id='commentPostCard'><p>shweta.xoxo</p><p>Literally goals 🔥</p></div></div>
                
              </div>

              <div id='postCardAddAComment'>
                <input type="text" placeholder="Add a comment..." name="text" class="input"/>
                <button>Post</button>
              </div>
            </div>

          </div>
      </div>
    </>
  )
}

export default postCard