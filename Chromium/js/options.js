$(document).ready(function () {
  // 删除a标签的active达到初始化的目的
  $("#options_exe button").removeClass('active');

  chrome.storage.local.get(getSave, function (result) {
    // 获取程序以及状态
    var options_exe = result.options_exe
    var options_proxy_server_state = result.options_proxy_server_state
    var options_proxy_server = result.options_proxy_server
    var options_host = result.options_host
    var options_token = result.options_token
    var options_uid = result.options_uid
    var options_source = result.options_source
    var options_imgur_post_mode = result.options_imgur_post_mode
    var options_expiration_select = result.options_expiration_select || "NODEL"
    var options_album_id = result.options_album_id
    var options_nsfw_select = result.options_nsfw_select || 0
    var options_permission_select = result.options_permission_select || 0

    //自定义请求
    var options_apihost = result.options_apihost
    var options_parameter = result.options_parameter
    var options_Headers = result.options_Headers
    var options_Body = result.options_Body
    var options_return_success = result.options_return_success
    var open_json_button = result.open_json_button

    //GitHub
    var options_owner = result.options_owner
    var options_repository = result.options_repository

    //对象存储
    var options_SecretId = result.options_SecretId
    var options_SecretKey = result.options_SecretKey
    var options_Bucket = result.options_Bucket
    var options_AppId = result.options_AppId
    var options_Endpoint = result.options_Endpoint
    var options_Region = result.options_Region
    var options_UploadPath = result.options_UploadPath
    var options_Custom_domain_name = result.options_Custom_domain_name

    //自定义图标区域
    var edit_uploadArea_width = result.edit_uploadArea_width
    var edit_uploadArea_height = result.edit_uploadArea_height
    var edit_uploadArea_Location = result.edit_uploadArea_Location
    var edit_uploadArea_opacity = result.edit_uploadArea_opacity
    var edit_uploadArea_auto_close_time = result.edit_uploadArea_auto_close_time
    var edit_uploadArea_Left_or_Right = result.edit_uploadArea_Left_or_Right
    // 初始化新安装时的判断跨域开关
    if (options_proxy_server_state == 0) {
      options_proxy_server = ""
    }
    if (!options_proxy_server) {
      options_proxy_server = ""
    }

    // 初始化新安装时的imgur模式
    if (!options_imgur_post_mode) {
      chrome.storage.local.set({ 'options_imgur_post_mode': "image" })
      options_imgur_post_mode = "image"
    }
    // 初始化新安装时的JSON转换模式
    if (!open_json_button) {
      chrome.storage.local.set({ 'open_json_button': 0 })
      open_json_button = 0
    }

    const html_exeLskyBox = `
    <div class="form-group">
      <label for="options_host" class="options_host">网站域名<p class="">(不需要携带任何前后缀,输入域名即可)</p>
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="例如:pnglog.com" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span style="color: red;">*</span>(Lsky程序必须填写Token)</p>
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="例如:Bearer 1|1bJbwlqBfnggmOMEZqXT5XusaIwqiZjCDs7r1Ob5" />
    </div>
    <div class="form-group">
      <label for="options_album_id" class="options_album_id">相册选择<p class="options_album_id_tips">(选择相册)</p>
      </label>
      <select id="options_album_id" class="form-select box-shadow">
      
      </select>
    </div>
    <div class="form-group">
      <label for="options_permission" class="options_permission">隐私选择<p class="options_permission_tips">(上传的内容是否公开,默认私有)</p>
      </label>
      <select id="options_permission_select" class="form-select box-shadow">
      <option selected value="0">私有</option>
      <option value="1">公开</option>
      </select>                
    </div>
    <div class="form-group">
      <label for="options_source" class="options_source">存储源选择<p class="options_uid_tips">(兰空图床程序可选存储源)</p>
      </label>
      <select id="options_source_select" class="form-select box-shadow">
      </select>
    </div>
  `
    const html_exeLskyBoxBottom_Tips = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://www.lsky.pro/" target="_blank"> 兰空图床 </a>程序的网站`

    const html_exeEasyImagesBox = `
<div class="form-group">
    <label for="options_host" class="options_host">网站域名<p class="">(不需要携带任何前后缀,输入域名即可)</p>
    </label>
    <input type="url" class="form-control box-shadow" id="options_host" placeholder="例如:png.cm" />
  </div>
  <div class="form-group">
    <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span style="color: red;">*</span>(EasyImages程序必须填写Token)</p>
    </label>
      <input type="text" class="form-control box-shadow" id="options_token"
                placeholder="例如:d21dc5039421455238b7152a6bf1cdc4" />
  </div>`
    const html_exeEasyImagesBoxBottom_Tips = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://png.cm/" target="_blank"> 简单图床 </a>程序的网站`

    const html_exeImgURLBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">网站域名<p class="">(不需要携带任何前后缀,输入域名即可)</p>
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="例如:www.imgurl.org" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span style="color: red;">*</span>(ImgURL程序必须填写Token)</p>
      </label>
      <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="例如:ddd35111f39990b2f104a138181d31bc" />
    </div>
    <div class="form-group">
      <label for="options_uid" class="options_uid">UID<p class="options_uid_tips"><span style="color: red;">*</span>(ImgURL程序必须填写UID)</p>
      </label>
      <input type="text" class="form-control box-shadow" id="options_uid" placeholder="例如:391e3afaf70fgcf4355f95a2g0876b87" />
    </div>
    `
    const html_exeImgURLBoxBottom_Tips = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://www.imgurl.org/" target="_blank"> ImgURL图床 </a>程序的网站`

    const html_exeSM_MSBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">网站域名<p class="">(不需要携带任何前后缀,输入域名即可)</p>
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="例如:sm.ms" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span style="color: red;">*</span>(SM.MS程序必须填写Token)</p>
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="例如:42GGhgkttap3D2hDQkCbiTlYGZ1Jx5Yx" />
    </div>`
    const html_exeSM_MSBoxBottom_Tips = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://sm.ms/" target="_blank"> SM.MS图床 </a>程序的网站`

    const html_exeCheveretoBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">网站域名<p class="">(不需要携带任何前后缀,输入域名即可)</p>
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="例如:demo.chevereto.com" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span style="color: red;">*</span>(Chevereto程序必须填写Token)</p>
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="例如:chv_Vxd5_618c6cf4dbbec416be206e4..." />
    </div>
    <div class="form-group">
      <label for="options_album_id" class="options_album_id">相册ID<p class="options_album_id_tips">(相册ID,默认为空)</p>
      </label>
        <input type="text" class="form-control box-shadow" id="options_album_id"
                  placeholder="例如:iXnGp" />
    </div>
    <div class="form-group">
      <label for="options_nsfw" class="options_nsfw">是否健康<p class="options_nsfw_tips">(上传的内容是否健康,默认健康)</p>
      </label>
      <select id="options_nsfw_select" class="form-select box-shadow">
      <option selected value="0">健康</option>
      <option value="1">不良</option>
      </select>                
    </div>
    <div class="form-group">
    <label for="options_expiration" class="options_expiration">删除时间<p class="options_expiration_tips">(删除时间,默认不自动删除)</p>
    </label>
    <select id="options_expiration_select" class="form-select box-shadow">
    <option selected value="NODEL">不自动删除</option>
    <option value="PT5M">5分钟</option>
    <option value="PT15M">15分钟</option>
    <option value="PT30M">30分钟</option>
    <option value="PT1H">1小时</option>
    <option value="PT3H">3小时</option>
    <option value="PT6H">6小时</option>
    <option value="PT12H">12小时</option>
    <option value="P1D">1天</option>
    <option value="P2D">2天</option>
    <option value="P3D">3天</option>
    <option value="P4D">4天</option>
    <option value="P5D">5天</option>
    <option value="P6D">6天</option>
    <option value="P1W">1周</option>
    <option value="P2W">2周</option>
    <option value="P3W">3周</option>
    <option value="P1M">1月</option>
    <option value="P2M">2月</option>
    <option value="P3M">3月</option>
    <option value="P4M">4月</option>
    <option value="P5M">5月</option>
    <option value="P6M">6月</option>
    <option value="P1Y">1年</option>
    </select>
    </div>
    `
    const html_exeCheveretoBoxBottom_Tips = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://demo.chevereto.com/" target="_blank"> Chevereto图床 </a>程序的网站`

    const html_exeCORSForm = `
  <div class="form-group CorsForm">
    <label for="options_proxy_server" class="options_proxy_server">CORS代理<p class="options_proxy_server_tips">(项目地址:<a href="https://github.com/Rob--W/cors-anywhere">Github</a>),
    例如:<code class="options_token_tips_code">https://cors-anywhere.herokuapp.com/</code>
  </p>
  </label>
    <input type="text" class="form-control box-shadow" id="options_proxy_server" placeholder="输入CORS代理服务器地址" />
  </div>`


    const html_exe_HellohaoBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">网站域名<p class="">(不需要携带任何前后缀,输入域名即可)</p>
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="例如:server.hellohao.cn" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span style="color: red;">*</span>(Hellohao程序必须填写Token)</p>
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="例如:02468631e6c13413bddefc0722e2389b" />
    </div>
    <div class="form-group">
      <label for="options_source" class="options_source">存储源选择<p class="options_uid_tips"><span style="color: red;">*</span>(Hellohao图床程序必须填写存储源)</p>
      </label>
      <input type="text" class="form-control box-shadow" id="options_source" placeholder="例如:12" />
    </div>
    `

    const html_exe_HellohaoBoxBottom_Tips = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://pic.hellohao.cn/" target="_blank"> Hellohao图床 </a>程序的网站`

    const html_exe_ImgurBox = `
  <div class="form-group">
  <label for="options_host" class="options_host">网站域名<p class="">(不需要携带任何前后缀,输入域名即可)</p>
  </label>
  <input type="url" class="form-control box-shadow" id="options_host" placeholder="例如:api.imgur.com" />
</div>
<div class="form-group">
  <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span
        style="color: red;">*</span><a style="color: #03a9f4;" href="https://api.imgur.com/oauth2/addclient"
        target="_blank">注册Client-ID</a>(imgur程序必须填写Token)</p>
  </label>
  <input type="text" class="form-control box-shadow" id="options_token" placeholder="例如:3596a2113fdg16f" />
</div>
<div class="ImgurPostModeDiv " style="text-align: center;">图片上传
  <label class="switch">
    <input id="options_imgur_post_mode" type="checkbox">
    <div class="slider round"></div>
  </label>视频上传
</div>
    `
    const html_exe_ImgurBoxBottom_Tipsa = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://imgur.com/" target="_blank"> Imgur图床 </a>程序的网站`


    const html_exe_UserDiyBox = `
  <div class="form-group">
  <label for="options_apihost" class="options_apihost">API地址<p class="">(完整的API地址)</p>
  </label>
  <input type="url" class="form-control box-shadow" id="options_apihost" placeholder="例如:https://pnglog.com/api/v1/upload" />
</div>
<div class="form-group">
  <label for="options_parameter" class="options_parameter">POST参数</span><p class="options_parameter_tips"><span style="color: red;">*</span>(上传图片参数)</p>
  </label>
  <input type="text" class="form-control box-shadow" id="options_parameter" placeholder="如:image 或 file" />
</div>
<div class="form-group">
  <label for="options_Headers" class="options_Headers">Headers请求头</span><p class="options_Headers_tips"><span style="color: red;">*</span>(自定义请求头,不需要可以留空)</p>
  </label>
  <div class="form-floating">
    <textarea class="form-control box-shadow" id="options_Headers"></textarea>
    <label for="floatingTextarea">使用JSON格式 如：{"Accept":"application/json","Authorization":"Bearer 1|1bJbwlb5"}</label>
  </div>
</div>
<div class="form-group">
  <label for="options_Body" class="options_Body">Body</span><p class="options_Body_tips"><span style="color: red;">*</span>(自定义Body,不需要可以留空)</p>
  </label>
  <div class="form-floating">
    <textarea class="form-control box-shadow" id="options_Body"></textarea>
    <label for="floatingTextarea">使用JSON格式 如：{"mail":"123@qq.com","password":"123456"}</label>
  </div>
</div>

<div class="form-group">
  <label for="options_Body" class="options_return_success">JSON路径<p class="options_return_success_tips"><span
        style="color: red;">*</span>(请求成功后的图片URL路径)</p>
  </label>
  <input type="text" class="form-control box-shadow" id="options_return_success" placeholder="如:data.links.url" />
  <div class="form-check form-switch" style="margin-top: 1rem;">
   <input class="form-check-input" type="checkbox" role="switch" id="open_json_button">
   <label class="form-check-label" for="flexSwitchCheckDefault">转到JSON<p>(将字符串转化为JSON)</p></label>
  </div>

  </div>
    `
    const html_exe_UserDiyBoxBottom_Tipsa = `当前配置适用于 用户自定义 的网站`

    const html_exe_GitHubUP = `
    <div class="form-group">
      <label for="options_owner" class="options_owner">用户名<p class="options_owner_tips"><span style="color: red;">*</span>(GitHub用户名)</p>
      </label>
      <input type="url" class="form-control box-shadow" id="options_owner" placeholder="例如:abcd" />
    </div>
    <div class="form-group">
      <label for="options_repository" class="options_repository">仓库名<p class="options_repository_tips"><span style="color: red;">*</span>(仓库名字)</p>
      </label>
      <input type="text" class="form-control box-shadow" id="options_repository" placeholder="例如:3596a2113fdg16f" />
    </div>
    <div class="form-group">
      <label for="options_UploadPath" class="options_UploadPath">上传路径<p class="options_UploadPath_tips">(给文件一个温暖的家,留空为根目录)</p>
      </label>
      <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="例如:images" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">Token<p class="options_token_tips"><span style="color: red;">*</span>(GitHub必须填写Token,获取<a style="color: #03a9f4;" href="https://github.com/settings/tokens" target="_blank"> Token </a>)</p>
      </label>
      <input type="text" class="form-control box-shadow" id="options_token" placeholder="例如:2389b" />
    </div>
      `
    const html_exe_GitHubUPBoxBottom_Tipsa = `当前配置适用于所有基于<a style="color: #03a9f4;" href="https://github.com/" target="_blank"> GitHub </a>网站`


    const html_exeTencent_COS = `
  <div class="form-group">
    <label for="options_SecretId" class="options_SecretId">SecretId<p class=""><span style="color: red;">*</span>(访问ID,获取<a style="color: #03a9f4;" href="https://console.cloud.tencent.com/cam/capi" target="_blank"> SecretId </a>)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_SecretId" placeholder="例如:asdasfsdgfdhytiuyrtwerrfcv1243rsdasd" />
  </div>
  <div class="form-group">
    <label for="options_SecretKey" class="options_SecretKey">SecretKey<p class="options_SecretKey_tips"><span style="color: red;">*</span>(访问密钥,获取<a style="color: #03a9f4;" href="https://console.cloud.tencent.com/cam/capi" target="_blank"> SecretKey </a>)</p>
    </label>
    <input type="password" class="form-control box-shadow" id="options_SecretKey" placeholder="例如:hgcscdsfwer1rdff346v54yvwdfsdx13" />
  </div>
  <div class="form-group">
    <label for="options_Bucket" class="options_Bucket">Bucket<p class="options_Bucket_tips"><span style="color: red;">*</span>(储存桶名称,查看<a style="color: #03a9f4;" href="https://console.cloud.tencent.com/cos/bucket" target="_blank"> 存储桶列表 </a>)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Bucket" placeholder="例如:abcd-112233445566" />
  </div>
  <div class="form-group">
    <label for="options_AppId" class="options_AppId">AppId<p class="options_AppId_tips">(应用ID)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_AppId" placeholder="例如:112233445566(储存桶名后面的数字)" />
  </div>
  <div class="form-group">
    <label for="options_Region" class="options_Region">Region<p class="options_Region_tips"><span style="color: red;">*</span>(区域)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Region" placeholder="例如:ap-hongkong" />
  </div>
  <div class="form-group">
    <label for="options_UploadPath" class="options_UploadPath">上传路径<p class="options_UploadPath_tips">(给文件一个温暖的家,留空为桶的根目录)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="例如:images或files" />
  </div>
  <div class="form-group">
    <label for="options_Custom_domain_name" class="options_Custom_domain_name">自定义访问域名<p class="options_Custom_domain_name_tips">(如果在<a style="color: #03a9f4;" href="https://console.cloud.tencent.com/cos" target="_blank"> 腾讯云COS </a>设定了话,留空不设置;)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Custom_domain_name" placeholder="例如:images.google.com" />
  </div>
  `
    const html_exeTencent_COSBoxBottom_Tips = `当前配置适用于<a style="color: #03a9f4;" href="https://console.cloud.tencent.com/cos" target="_blank"> 腾讯云COS </a>`
    const cos_cors = `
  <div class="btn-group " id="Object_Storage_cors">
  <button id="" type="button" class="btn btn-primary">设置COS的CORS</button>
  </div>
  `
    const cos_putBucketACL = `
  <div class="btn-group " id="putBucketACL">
    <button type="button" class="btn btn-primary dropdown-toggle putBucketACL" data-bs-toggle="dropdown" aria-expanded="false">
      设置访问权限
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#" value="private"><i class="bi bi-incognito"></i>私有读/私有写</a></li>
      <li><a class="dropdown-item" href="#" value="public-read"><i class="bi bi-file-earmark-lock"></i>私有写/公共读(推荐)</a>
      </li>
      <li><a class="dropdown-item" href="#" value="public-read-write"><i class="bi bi-folder2-open"></i>公共读/公共写</a></li>
    </ul>
  </div>
  `


    const html_exeAliyun_OSS = `
  <div class="form-group">
    <label for="options_SecretId" class="options_SecretId">AccessKeyId<p class=""><span style="color: red;">*</span>(访问ID,获取<a style="color: #03a9f4;" href="https://ram.console.aliyun.com/manage/ak" target="_blank"> AccessKeyId </a>)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_SecretId" placeholder="例如:asdasfsdgfdhytiuyrtwerrfcv1243rsdasd" />
  </div>
  <div class="form-group">
    <label for="options_SecretKey" class="options_SecretKey">AccessKeySecret<p class="options_SecretKey_tips"><span style="color: red;">*</span>(访问密钥,获取<a style="color: #03a9f4;" href="https://ram.console.aliyun.com/manage/ak" target="_blank"> AccessKeySecret </a>)</p>
    </label>
    <input type="password" class="form-control box-shadow" id="options_SecretKey" placeholder="例如:hgcscdsfwer1rdff346v54yvwdfsdx13" />
  </div>
  <div class="form-group">
    <label for="options_Bucket" class="options_Bucket">Bucket<p class="options_Bucket_tips"><span style="color: red;">*</span>(储存桶名称,查看<a style="color: #03a9f4;" href="https://oss.console.aliyun.com/bucket" target="_blank"> 存储桶列表 </a>)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Bucket" placeholder="例如:abcde-images" />
  </div>
  <div class="form-group">
    <label for="options_Endpoint" class="options_Endpoint">Endpoint<p class="options_Endpoint_tips"><span style="color: red;">*</span>(区域节点,查看<a style="color: #03a9f4;" href="https://help.aliyun.com/document_detail/31837.html" target="_blank"> 访问域名和数据中心 </a>)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Endpoint" placeholder="例如:oss-cn-beijing.aliyuncs.com" />
  </div>
  <div class="form-group">
    <label for="options_Region" class="options_Region">Region<p class="options_Region_tips"><span style="color: red;">*</span>(区域)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Region" placeholder="例如:oss-cn-beijing" />
  </div>
  <div class="form-group">
    <label for="options_UploadPath" class="options_UploadPath">上传路径<p class="options_UploadPath_tips">(给文件一个温暖的家,留空为桶的根目录)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="例如:images或files" />
  </div>
  <div class="form-group">
    <label for="options_Custom_domain_name" class="options_Custom_domain_name">自定义访问域名<p class="options_Custom_domain_name_tips">(如果在<a style="color: #03a9f4;" href="https://oss.console.aliyun.com/overview" target="_blank"> 阿里云OSS </a>设定了话,留空不设置;)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Custom_domain_name" placeholder="例如:images.google.com" />
  </div>
  `
    const html_exeAliyun_OSSBoxBottom_Tips = `当前配置适用于<a style="color: #03a9f4;" href="https://oss.console.aliyun.com/oss" target="_blank"> 阿里云OSS </a>`
    const oss_cors = ` 
  <div class="btn-group " id="Object_Storage_cors">
    <button type="button" class="btn btn-primary">设置OSS的CORS</button>
    </div>
    `
    const oss_putBucketACL = `
  <div class="btn-group " id="putBucketACL">
    <button type="button" class="btn btn-primary dropdown-toggle putBucketACL" data-bs-toggle="dropdown" aria-expanded="false">
      设置访问权限
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#" value="private"><i class="bi bi-incognito"></i>私有读/私有写</a></li>
      <li><a class="dropdown-item" href="#" value="public-read"><i class="bi bi-file-earmark-lock"></i>私有写/公共读(推荐)</a>
      </li>
      <li><a class="dropdown-item" href="#" value="public-read-write"><i class="bi bi-folder2-open"></i>公共读/公共写</a></li>
    </ul>
  </div>
  `

    const html_exeAWS_S3 = `
  <div class="form-group">
    <label for="options_SecretId" class="options_SecretId">访问ID<p class=""><span style="color: red;">*</span>(访问ID)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_SecretId" placeholder="例如:asdasfsdgfdhytiuyrtwerrfcv1243rsdasd" />
  </div>
  <div class="form-group">
    <label for="options_SecretKey" class="options_SecretKey">访问密钥<p class="options_SecretKey_tips"><span style="color: red;">*</span>(访问密钥)</p>
    </label>
    <input type="password" class="form-control box-shadow" id="options_SecretKey" placeholder="例如:hgcscdsfwer1rdff346v54yvwdfsdx13" />
  </div>
  <div class="form-group">
    <label for="options_Bucket" class="options_Bucket">Bucket<p class="options_Bucket_tips"><span style="color: red;">*</span>(储存桶名称)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Bucket" placeholder="注意:如果要使用自定义域名请将桶名称设置为域名,例如:images.google.com" />
  </div>
  <div class="form-group">
    <label for="options_Region" class="options_Region">Region<p class="options_Region_tips"><span style="color: red;">*</span>(区域)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Region" placeholder="例如:oss-cn-beijing" />
  </div>
  <div class="form-group">
    <label for="options_Endpoint" class="options_Endpoint">Endpoint<p class="options_Endpoint_tips">(区域节点,<span style="color: red;">S3 兼容(必填)</span>对接请填写完整域名,留空默认AWS S3;)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Endpoint" placeholder="例如:https://{accountid}.r2.cloudflarestorage.com" />
  </div>
  <div class="form-group">
    <label for="options_UploadPath" class="options_UploadPath">上传路径<p class="options_UploadPath_tips">(给文件一个温暖的家,留空为桶的根目录)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="例如:images或files" />
  </div>
  <div class="form-group">
    <label for="options_Custom_domain_name" class="options_Custom_domain_name">自定义访问域名<p class="options_Custom_domain_name_tips">(<span style="color: red;">S3 兼容(必填)</span>,如果设定了话,留空不设置;)</p>
    </label>
    <input type="text" class="form-control box-shadow" id="options_Custom_domain_name" placeholder="注意:S3自定义域名要和桶名称一致,例如:images.google.com" />
  </div>
  `
    const html_exeAWS_S3Bottom_Tips = `当前配置适用于<a style="color: #03a9f4;" href="https://s3.console.aws.amazon.com/" target="_blank"> AWS S3 </a>`
    const s3_cors = ` 
  <div class="btn-group " id="Object_Storage_cors">
    <button type="button" class="btn btn-primary">设置S3的CORS</button>
    </div>
    `

    var optionsProg = {
      '#exe_Lsky': {
        'needUid': 1,
        'html_exeBox': html_exeLskyBox,
        'bottomTips': html_exeLskyBoxBottom_Tips
      },
      '#exe_EasyImages': {
        'needUid': 2,
        'html_exeBox': html_exeEasyImagesBox,
        'bottomTips': html_exeEasyImagesBoxBottom_Tips
      },
      '#exe_ImgURL': {
        'needUid': 3,
        'html_exeBox': html_exeImgURLBox,
        'bottomTips': html_exeImgURLBoxBottom_Tips
      },
      '#exe_SM_MS': {
        'needUid': 4,
        'html_exeBox': html_exeSM_MSBox,
        'bottomTips': html_exeSM_MSBoxBottom_Tips
      },
      '#exe_Chevereto': {
        'needUid': 5,
        'html_exeBox': html_exeCheveretoBox,
        'bottomTips': html_exeCheveretoBoxBottom_Tips
      },
      '#exe_Hellohao': {
        'needUid': 6,
        'html_exeBox': html_exe_HellohaoBox,
        'bottomTips': html_exe_HellohaoBoxBottom_Tips
      },
      '#exe_Imgur': {
        'needUid': 7,
        'html_exeBox': html_exe_ImgurBox,
        'bottomTips': html_exe_ImgurBoxBottom_Tipsa
      },
      '#exe_UserDiy': {
        'needUid': 8,
        'html_exeBox': html_exe_UserDiyBox,
        'bottomTips': html_exe_UserDiyBoxBottom_Tipsa
      },
      '#exe_Tencent_COS': {
        'needUid': 9,
        'html_exeBox': html_exeTencent_COS,
        'bottomTips': html_exeTencent_COSBoxBottom_Tips
      },
      '#exe_Aliyun_OSS': {
        'needUid': 10,
        'html_exeBox': html_exeAliyun_OSS,
        'bottomTips': html_exeAliyun_OSSBoxBottom_Tips
      },
      '#exe_AWS_S3': {
        'needUid': 11,
        'html_exeBox': html_exeAWS_S3,
        'bottomTips': html_exeAWS_S3Bottom_Tips
      },
      '#exe_GitHubUP': {
        'needUid': 12,
        'html_exeBox': html_exe_GitHubUP,
        'bottomTips': html_exe_GitHubUPBoxBottom_Tipsa
      },
      'default': {
        'body': `
      <div class="alert alert-secondary" role="alert">
        <h4 class="alert-heading">嗨，你好朋友</h4>
        <p> 一定要选择一个图床程序进行图床配置哦</p>
        <hr>
        <div id="carouselExampleCaptions" class="carousel slide" data-bs-ride="carousel">
      <!-- 按钮 -->
      <div class="carousel-indicators">
        <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="0" class="active"
          aria-current="true" aria-label="Slide 1"></button>
        <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="1"
          aria-label="Slide 2"></button>
        <button type="button" data-bs-target="#carouselExampleCaptions" data-bs-slide-to="2"
          aria-label="Slide 3"></button>
      </div>

      <!-- 内容 -->
      <div class="carousel-inner">
        <div class="carousel-item active">
          <img src="https://cdn-us.imgs.moe/2023/03/23/641c6a131923f.png" class="d-block w-100">
          <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
            <h1>你知道吗?</h1>
            <p >盘络上传是可以对着图片右键上传的喔！</p>
          </div>
        </div>
        <div class="carousel-item">
          <img src="https://cdn-us.imgs.moe/2023/03/23/641c6a1456d1b.png" class="d-block w-100" loading="lazy">
          <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
            <h1>你知道吗?</h1>
            <p>盘络上传是可以获取图床相册的,允许读取本地和网络信息呢！</p>
          </div>
        </div>
        <div class="carousel-item">
          <img src="https://cdn-us.imgs.moe/2023/03/23/641c6a143794d.png" class="d-block w-100" loading="lazy">
          <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
            <h1>你知道吗?</h1>
            <p>盘络上传页面是允许使用粘贴本地图片、网络图片以及图片链接进行上传的喔！</p>
          </div>
        </div>
      </div>
      <!-- 左 -->
      <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <!-- 右 -->
      <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
      </div>
      `
      }
    };

    if (options_exe == 'Tencent_COS') {
      try {
        let getAuthorization = function (options, callback) {
          let authorization = COS.getAuthorization({
            SecretId: options_SecretId,
            SecretKey: options_SecretKey,
            Method: options.Method,
            Pathname: options.Pathname,
            Query: options.Query,
            Headers: options.Headers,
            Expires: 900,
          });
          callback({ Authorization: authorization });
        };
        var cos = new COS({
          getAuthorization: getAuthorization,
          UploadCheckContentMd5: true,
          protocol: 'https:' // 强制使用 HTTPS 协议
        });
      } catch (error) {
        toastItem({
          toast_content: error
        });
      }

    }
    if (options_exe == 'Aliyun_OSS') {
      try {
        var oss = new OSS({
          accessKeyId: options_SecretId,
          accessKeySecret: options_SecretKey,
          bucket: options_Bucket,
          endpoint: options_Endpoint,
          region: options_Region,
          secure: true //强制https
        });
      } catch (error) {
        toastItem({
          toast_content: error
        });
      }

    }
    if (options_exe == 'AWS_S3') {
      try {
        AWS.config.update({
          accessKeyId: options_SecretId,
          secretAccessKey: options_SecretKey,
          region: options_Region,
          endpoint: options_Endpoint,
          signatureVersion: 'v4'
        });
        var s3 = new AWS.S3();
      } catch (error) {
        toastItem({
          toast_content: error
        });
      }

    }

    function Input_box_loading() {
      let prog = optionsProg['#exe_' + options_exe];
      // 加载元素配置
      if (!prog) {
        prog = optionsProg["default"]
        $("#options-form").append(prog.body)
      } else {
        $('#options-form').append(prog.html_exeBox);
        Edit_Box_Animation()
        $('.text-bottom-Tips1').html(prog.bottomTips);
        $("#options_host").val(options_host);
        $("#options_token").val(options_token);
      }
      switch (options_exe) {
        case 'Lsky':
          $("#exe_Lsky").addClass('active');
          $('#options_permission_select').val(options_permission_select);
          GetSource()
          Getalbums()
          break;
        case 'EasyImages':
          $("#exe_EasyImages").addClass('active');
          break;
        case 'ImgURL':
          $("#exe_ImgURL").addClass('active');
          $("#options_uid").val(options_uid);
          break;
        case 'SM_MS':
          $("#exe_SM_MS").addClass('active');
          $('#options_host').attr("disabled", true);
          break;
        case 'Chevereto':
          $("#exe_Chevereto").addClass('active');
          $("#options_album_id").val(options_album_id);
          $('#options_expiration_select').val(options_expiration_select);
          $('#options_nsfw_select').val(options_nsfw_select);
          break;
        case 'Hellohao':
          $("#exe_Hellohao").addClass('active');
          $("#options_source").val(options_source);
          break;
        case 'Imgur':
          $("#exe_Imgur").addClass('active');
          $('#options_host').attr("disabled", true);
          options_imgur_post_modeFn()
          break;
        case 'UserDiy':
          $("#exe_UserDiy").addClass('active');
          $("#options_apihost").val(options_apihost);
          $("#options_parameter").val(options_parameter);
          $("#options_Headers").val(options_Headers);
          $("#options_Body").val(options_Body);
          $("#options_return_success").val(options_return_success);
          // 初始化JSON转换
          open_json_buttonFn()
          break;
        case 'Tencent_COS':
          $("#exe_Tencent_COS").addClass('active');
          $("#options_SecretId").val(options_SecretId);
          $("#options_SecretKey").val(options_SecretKey);
          $("#options_Bucket").val(options_Bucket);
          $("#options_AppId").val(options_AppId);
          $("#options_Region").val(options_Region);
          $("#options_UploadPath").val(options_UploadPath);
          $("#options_Custom_domain_name").val(options_Custom_domain_name);
          $("#CorsButton").parent().append(cos_cors)
          $("#CorsButton").parent().append(cos_putBucketACL)
          setBucketACL()
          setBucketCors()
          break;
        case 'Aliyun_OSS':
          $("#exe_Aliyun_OSS").addClass('active');
          $("#options_SecretId").val(options_SecretId);
          $("#options_SecretKey").val(options_SecretKey);
          $("#options_Bucket").val(options_Bucket);
          $("#options_Endpoint").val(options_Endpoint);
          $("#options_Region").val(options_Region);
          $("#options_UploadPath").val(options_UploadPath);
          $("#options_Custom_domain_name").val(options_Custom_domain_name);
          $("#CorsButton").parent().append(oss_cors)
          $("#CorsButton").parent().append(oss_putBucketACL)
          setBucketACL()
          setBucketCors()
          break;
        case 'AWS_S3':
          $("#exe_AWS_S3").addClass('active');
          $("#options_SecretId").val(options_SecretId);
          $("#options_SecretKey").val(options_SecretKey);
          $("#options_Bucket").val(options_Bucket);
          $("#options_Region").val(options_Region);
          $("#options_Endpoint").val(options_Endpoint);
          $("#options_UploadPath").val(options_UploadPath);
          $("#CorsButton").parent().append(s3_cors)
          $("#options_Custom_domain_name").val(options_Custom_domain_name);
          setBucketCors()
          break;
        case 'GitHubUP':
          $("#exe_GitHubUP").addClass('active');
          $("#options_owner").val(options_owner);
          $("#options_repository").val(options_repository);
          $("#options_UploadPath").val(options_UploadPath);
          $("#options_token").val(options_token);
          break;
        default:
      }

    }
    Input_box_loading()

    $('#options_exe button').on('click', function () {
      // 实现点击图床程序
      $('#options-form').empty()
      let progId = $(this).attr("id");
      let prog = optionsProg['#' + progId];
      $("#Object_Storage_cors").remove()
      $("#putBucketACL").remove()
      if (prog.needUid == 1) {
        $('#options-form').append(prog.html_exeBox);
        $("#options_host").val(options_host);
        $("#options_token").val(options_token);
        $('#options_permission_select').val(options_permission_select);
        GetSource()
        Getalbums()
      }
      if (prog.needUid == 2) {//EasyImages
        $('#options-form').append(prog.html_exeBox);
        $("#options_host").val(options_host);
        $("#options_token").val(options_token);
      }
      if (prog.needUid == 3) {//imgurl
        $('#options-form').append(prog.html_exeBox);
        $("#options_host").val(options_host);
        $("#options_token").val(options_token);
        $("#options_uid").val(options_uid);
        $("#options_uid").attr("placeholder", prog.uidText);
      }
      if (prog.needUid == 4) {//sm.ms
        $('#options-form').append(prog.html_exeBox);
        $('#options_host').val("sm.ms")
        $("#options_token").val(options_token);
        $('#options_host').attr("disabled", true)
      }
      if (prog.needUid == 5) {//chevereto
        $('#options-form').append(prog.html_exeBox);
        $("#options_host").val(options_host);
        $("#options_token").val(options_token);
        $("#options_album_id").val(options_album_id);
        $('#options_expiration_select').val(options_expiration_select);
        $('#options_nsfw_select').val(options_nsfw_select);
      }
      if (prog.needUid == 6) {//hellohao
        $('#options-form').append(prog.html_exeBox);
        $("#options_host").val(options_host);
        $("#options_token").val(options_token);
        $("#options_source").val(options_source);
        $("#options_source").attr("placeholder", prog.sourceText);

      }
      if (prog.needUid == 7) {//imgur
        $('#options-form').append(prog.html_exeBox);
        $('#options_host').val("api.imgur.com")
        $("#options_token").val(options_token);
        $('#options_host').attr("disabled", true)
        options_imgur_post_modeFn()
      }
      if (prog.needUid == 8) {//diy
        $('#options-form').append(prog.html_exeBox);
        $("#options_apihost").val(options_apihost);
        $("#options_parameter").val(options_parameter);
        $("#options_Headers").val(options_Headers);
        $("#options_Body").val(options_Body);
        $("#options_return_success").val(options_return_success);
        // JSON转换
        open_json_buttonFn()
      }
      if (prog.needUid == 9) {//cos
        $('#options-form').append(prog.html_exeBox);
        $("#options_SecretId").val(options_SecretId);
        $("#options_SecretKey").val(options_SecretKey);
        $("#options_Bucket").val(options_Bucket);
        $("#options_AppId").val(options_AppId);
        $("#options_Region").val(options_Region);
        $("#options_UploadPath").val(options_UploadPath);
        $("#options_Custom_domain_name").val(options_Custom_domain_name);
        $("#CorsButton").parent().append(cos_cors)
        $("#CorsButton").parent().append(cos_putBucketACL)
        setBucketACL()
        setBucketCors()
        if ($('#CorsButton button').is(".btn-danger")) {
          Close_CORS_Element()
        }
      }
      if (prog.needUid == 10) {//oss
        $('#options-form').append(prog.html_exeBox);
        $("#options_SecretId").val(options_SecretId);
        $("#options_SecretKey").val(options_SecretKey);
        $("#options_Bucket").val(options_Bucket);
        $("#options_Endpoint").val(options_Endpoint);
        $("#options_Region").val(options_Region);
        $("#options_UploadPath").val(options_UploadPath);
        $("#options_Custom_domain_name").val(options_Custom_domain_name);
        $("#CorsButton").parent().append(oss_cors)
        $("#CorsButton").parent().append(oss_putBucketACL)
        setBucketACL()
        setBucketCors()
        if ($('#CorsButton button').is(".btn-danger")) {
          Close_CORS_Element()
        }

      }
      if (prog.needUid == 11) {//aws s3
        $('#options-form').append(prog.html_exeBox);
        $("#options_SecretId").val(options_SecretId);
        $("#options_SecretKey").val(options_SecretKey);
        $("#options_Bucket").val(options_Bucket);
        $("#options_Region").val(options_Region);
        $("#options_Endpoint").val(options_Endpoint);
        $("#options_UploadPath").val(options_UploadPath);
        $("#options_Custom_domain_name").val(options_Custom_domain_name);
        $("#CorsButton").parent().append(s3_cors)
        setBucketCors()
        if ($('#CorsButton button').is(".btn-danger")) {
          Close_CORS_Element()
        }

      }
      if (prog.needUid == 12) {//GitHub
        $('#options-form').append(prog.html_exeBox);
        $("#options_owner").val(options_owner);
        $("#options_repository").val(options_repository);
        $("#options_UploadPath").val(options_UploadPath);
        $("#options_token").val(options_token);
      }

      //判断cors开关
      chrome.storage.local.get(["options_proxy_server_state"], function (result) {
        if (result.options_proxy_server_state == 1) {
          Insert_CORS_Element()
        }
      });

      Edit_Box_Animation()
      $('.text-bottom-Tips1').html(prog.bottomTips);
    });

    /**
     * 编辑框动画
     */
    async function Edit_Box_Animation() {
      $('.form-group').hide().slideDown('slow');// 编辑框动画
    }

    function setBucketCors() {
      $("#Object_Storage_cors").click(function () {
        switch (options_exe) {
          case 'Tencent_COS':
            if ($('#exe_Tencent_COS').hasClass('active')) {
              /**
              * 腾讯云cors设置
              */
              function cos_putBucketCors() {
                cos.putBucketCors({
                  Bucket: options_Bucket,
                  Region: options_Region,
                  CORSRules: [{
                    "AllowedOrigin": ["*"],
                    "AllowedMethod": ["GET", "POST", "PUT", "DELETE"],
                    "AllowedHeader": ["*"],
                    "ExposeHeader": ["ETag", "x-cos-acl", "x-cos-version-id", "x-cos-delete-marker", "x-cos-server-side-encryption"],
                    "MaxAgeSeconds": "300"
                  }]
                }, function (err, data) {
                  if (data) {
                    toastItem({
                      toast_content: '腾讯云对象存储CORS设置成功',
                      toast_DestroyTime: '15000'
                    })
                    $("#Object_Storage_cors button").attr("disabled", 'true')
                  }
                  if (err) {
                    console.error(err)
                    toastItem({
                      toast_content: "设置失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                    })
                    $("#Object_Storage_cors button").attr("disabled", 'false')
                  }
                });
              }
              /**
              * 腾讯云cors查询并调用设置
              */
              async function set_cos_cors() {
                cos.getBucketCors({
                  Bucket: options_Bucket, /* 必须 */
                  Region: options_Region,     /* 存储桶所在地域，必须字段 */
                }, function (err, data) {
                  console.log(err || data);
                  if (data) {
                    $("#Object_Storage_cors button").attr("disabled", 'true')
                    if (data.CORSRules.length < 1) {
                      cos_putBucketCors()
                    } else {
                      if (data.CORSRules[0].AllowedOrigins == "*" && data.CORSRules[0].AllowedHeaders == "*") {
                        toastItem({
                          toast_content: "查询到已设置CORS"
                        })
                        return;
                      } else {
                        cos_putBucketCors()
                      }
                    }
                  }
                  if (err) {
                    $("#Object_Storage_cors button").attr("disabled", 'false')
                    toastItem({
                      toast_content: "设置失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                    })
                  }
                });
              }
              set_cos_cors()
            } else {
              $("#Object_Storage_cors button").attr("disabled", 'true')
              toastItem({
                toast_content: '请先保存再进行设置'
              });
            }

            break;
          case 'Aliyun_OSS':
            if ($('#exe_Aliyun_OSS').hasClass('active')) {
              /**
              * 阿里云cors设置
              */
              function oss_putBucketCors() {
                oss.putBucketCORS(options_Bucket, [{
                  allowedOrigin: '*',
                  allowedMethod: ["GET", "POST", "PUT", "DELETE"],
                  allowedHeader: '*',
                  exposeHeader: ["ETag", 'Content-Length', "x-oss-request-id"],
                  maxAgeSeconds: '300'
                }]).then((res) => {
                  toastItem({
                    toast_content: '阿里云对象存储CORS设置成功',
                    toast_DestroyTime: '15000'
                  })
                  $("#Object_Storage_cors").attr("disabled", 'true')
                }).catch(error => {
                  console.error(error)
                  toastItem({
                    toast_content: "设置失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                  })
                  $("#Object_Storage_cors").attr("disabled", 'false')
                });
              }
              /**
              * 阿里云cors查询并调用设置
              */
              async function set_oss_cors() {
                oss.getBucketCORS(options_Bucket).then((res) => {
                  if (res.rules[0].allowedOrigin == "*" && res.rules[0].allowedHeader == "*") {
                    toastItem({
                      toast_content: "查询到已设置CORS"
                    })
                    return;
                  } else {
                    oss_putBucketCors()
                  }
                }).catch(error => {
                  oss_putBucketCors()
                });
              }
              set_oss_cors()
            } else {
              $("#Object_Storage_cors button").attr("disabled", 'true')
              toastItem({
                toast_content: '请先保存再进行设置'
              });
            }
            break;
          case 'AWS_S3':
            if ($('#exe_AWS_S3').hasClass('active')) {
              /**
              * AWS S3设置
              */
              function s3_putBucketCors() {
                s3.putBucketCors({
                  Bucket: options_Bucket,
                  CORSConfiguration: {
                    CORSRules: [
                      {
                        AllowedHeaders: [
                          "*"
                        ],
                        AllowedMethods: [
                          "GET",
                          "POST",
                          "PUT",
                          "DELETE"
                        ],
                        AllowedOrigins: [
                          "*"
                        ],
                        ExposeHeaders: [
                          "ETag",
                          "x-amz-server-side-encryption",
                          "x-amz-request-id",
                          "x-amz-id-2"
                        ],
                        MaxAgeSeconds: 300
                      }
                    ]
                  }
                }, function (err, data) {
                  if (data) {
                    toastItem({
                      toast_content: 'S3对象存储CORS设置成功',
                      toast_DestroyTime: '15000'
                    })
                    $("#Object_Storage_cors button").attr("disabled", 'true')
                  }
                  if (err) {
                    console.error(err)
                    toastItem({
                      toast_content: "设置失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                    })
                    $("#Object_Storage_cors button").attr("disabled", 'false')
                  }
                });
              }
              /**
              * AWS S3查询并调用设置
              */
              async function set_oss_cors() {
                s3.getBucketCors({ Bucket: options_Bucket }, function (err, data) {
                  if (err) {
                    let not = err.toString().indexOf("The CORS configuration does not exist")
                    if (not != -1) {
                      s3_putBucketCors()
                    }
                  }
                  if (data) {
                    $("#Object_Storage_cors button").attr("disabled", 'true')
                    if (data.CORSRules[0].AllowedOrigins == "*" && data.CORSRules[0].AllowedHeaders == "*") {
                      toastItem({
                        toast_content: "查询到已设置CORS"
                      })
                      return;
                    } else {
                      s3_putBucketCors()
                    }
                  }
                });
              }
              set_oss_cors()
            } else {
              $("#Object_Storage_cors button").attr("disabled", 'true')
              toastItem({
                toast_content: '请先保存再进行设置'
              });
            }
            break;
        }
      })

    }


    function setBucketACL() {
      $("#putBucketACL .putBucketACL").click(function () {
        $('#putBucketACL li').addClass("list-group-item disabled");
        $('#putBucketACL li').attr("aria-disabled", true)
        switch (options_exe) {
          case 'Tencent_COS':
            if ($('#exe_Tencent_COS').hasClass('active')) {
              async function cos_getBucketAcl() {
                try {
                  const result = await cos.getBucketAcl({ Bucket: options_Bucket, Region: options_Region });
                  $('#putBucketACL a[value="' + result.ACL + '"]').addClass('active');
                  $('#putBucketACL li').removeClass("disabled")
                  $('#putBucketACL li').attr("aria-disabled", false)

                } catch (error) {
                  console.log(error)
                  toastItem({
                    toast_content: "设置失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                  })
                }
              }
              cos_getBucketAcl()
            } else {
              $('#putBucketACL button').attr("disabled", true)
              $('#putBucketACL ul').removeClass("show")
              toastItem({
                toast_content: '请先保存再进行设置'
              });
            }
            break;
          case 'Aliyun_OSS':
            if ($('#exe_Aliyun_OSS').hasClass('active')) {
              async function oss_getBucketAcl() {
                try {
                  const result = await oss.getBucketACL(options_Bucket)
                  $('#putBucketACL a[value="' + result.acl + '"]').addClass('active');
                  $('#putBucketACL li').removeClass("disabled")
                  $('#putBucketACL li').attr("aria-disabled", false)
                } catch (error) {
                  console.log(error)
                  toastItem({
                    toast_content: "设置失败,请打开DevTools查看报错并根据常见问题进行报错排除"
                  })
                }
              }
              oss_getBucketAcl()
            } else {
              $('#putBucketACL button').attr("disabled", true)
              $('#putBucketACL ul').removeClass("show")
              toastItem({
                toast_content: '请先保存再进行设置'
              });
            }
            break;
        }

      })
      $("#putBucketACL .dropdown-item").click(function () {
        const acl = $(this).attr("value");
        switch (options_exe) {
          case 'Tencent_COS':
            async function cos_putBucketACL() {
              try {
                await cos.putBucketAcl({ Bucket: options_Bucket, Region: options_Region, ACL: acl });
                $('#putBucketACL a').removeClass('active');
                $('#putBucketACL a[value="' + acl + '"]').addClass('active');
              } catch (error) {
                console.log(error)
              }
            }
            cos_putBucketACL()
            break;
          case 'Aliyun_OSS':
            async function oss_putBucketACL() {
              // 此处以创建存储空间后修改其访问权限为private为例。
              try {
                await oss.putBucketACL(options_Bucket, acl)
                $('#putBucketACL a').removeClass('active');
                $('#putBucketACL a[value="' + acl + '"]').addClass('active');
              } catch (error) {
                console.log(error)
              }
            }
            oss_putBucketACL()
            break;
        }
      });
    }


    /**
     * 获取兰空图床存储源
     */
    function GetSource() {
      if (options_host) {//不为空时
        sendAjax(
          options_proxy_server + "https://" + options_host + "/api/v1/strategies",
          'GET',
          null,
          {
            "Accept": "application/json",
            "Authorization": options_token
          },
          function (res) {
            let strategies = res.data.strategies
            $("#options_source_select").empty();
            strategies.forEach(function (e, index) {
              $("#options_source_select").append(
                `<option value="` + e.id + `">` + e.name + `</option>`
              )
            })
            chrome.storage.local.get('options_source_select', function (data) {
              let selectedValue = data.options_source_select;
              let option = $('#options_source_select option[value=' + selectedValue + ']');
              if (option.length) {
                // 如果没有就选择第一个
                $('#options_source_select').val(selectedValue);
              } else {
                $('#options_source_select option:first').prop('selected', true);
                chrome.storage.local.set({ 'options_source_select': $("#options_source_select").val() })
              }

            });

          },

          function (error) {
            $("#options_source_select").append(
              `<option selected value="NO">无法获取存储源</option></option>`
            )
            console.log(error)
          }
        )
      }
    }
    /**
     * 获取兰空图床相册列表
     */
    function Getalbums() {
      if (options_host) {//不为空时
        sendAjax(
          options_proxy_server + "https://" + options_host + "/api/v1/albums",
          'GET',
          null,
          {
            "Accept": "application/json",
            "Authorization": options_token
          },
          function (res) {
            let albums = res.data.data
            $("#options_album_id").empty();
            $("#options_album_id").append(
              `<option selected value="">默认</option></option>`
            )
            albums.forEach(function (e, index) {
              $("#options_album_id").append(
                `<option value="` + e.id + `">` + e.name + `</option>`
              )
            })
            chrome.storage.local.get('options_album_id', function (data) {
              let selectedValue = data.options_album_id;
              let option = $('#options_album_id option[value=' + selectedValue + ']');
              if (option.length) {
                // 如果没有就选择第一个
                $('#options_album_id').val(selectedValue);
              } else {
                $('#options_album_id option:first').prop('selected', true);
                chrome.storage.local.set({ 'options_album_id': $("#options_album_id").val() })
              }

            });
          },
          function (err) {
            $("#options_album_id").append(
              `<option selected value="NO">无法获取相册</option></option>`
            )
            console.log(err)
          }
        )
      }
    }
    /**
     * 实现imgur上传方式如图片还是视频
     */
    function options_imgur_post_modeFn() {
      $('#options_imgur_post_mode').click(function () {
        if ($('#options_imgur_post_mode').is(':checked')) {
          chrome.storage.local.set({ 'options_imgur_post_mode': "video" })
          // 开启
          toastItem({
            toast_content: "当前模式为：视频上传模式",
          })

        } else {
          chrome.storage.local.set({ 'options_imgur_post_mode': "image" })
          // 关闭
          toastItem({
            toast_content: "当前模式为：图片上传模式",
          })
        }
      });

      // 判断模式
      chrome.storage.local.get(["options_imgur_post_mode"], function (result) {
        if (result.options_imgur_post_mode == "video") {
          $('#options_imgur_post_mode').attr('checked', true);
        }
      })
    }
    // 保存配置
    $("#options_save").click(function () {
      $(this).addClass('btn-danger');
      let optionsExe = $("#options_exe button.active");
      if (optionsExe.length) {
        let proxyServer = $('#options_proxy_server');
        if (proxyServer.val() == "") {
          toastItem({
            toast_content: 'CORS代理不能为空'
          })
          setTimeout(function () {
            $("#options_save").removeClass('btn-danger');
          }, 2000);
          return;
        }
        chrome.storage.local.set({ 'options_host': $("#options_host").val() })
        if ($('#exe_Lsky').hasClass('active')) {
          let string = $("#options_token").val()
          let pattern = /^Bearer\s/;
          if (pattern.test(string)) {
            chrome.storage.local.set({ 'options_token': $("#options_token").val() })
          } else {
            chrome.storage.local.set({ 'options_token': `Bearer ` + string })
          }

        } else {
          chrome.storage.local.set({ 'options_token': $("#options_token").val() })
        }
        chrome.storage.local.set({ 'options_source_select': $("#options_source_select").val() })
        chrome.storage.local.set({ 'options_expiration_select': $("#options_expiration_select").val() })
        chrome.storage.local.set({ 'options_permission_select': $("#options_permission_select").val() })
        chrome.storage.local.set({ 'options_album_id': $("#options_album_id").val() })
        chrome.storage.local.set({ 'options_nsfw_select': $("#options_nsfw_select").val() })
        chrome.storage.local.set({ 'options_uid': $("#options_uid").val() })
        chrome.storage.local.set({ 'options_source': $("#options_source").val() })
        chrome.storage.local.set({ 'options_exe': optionsExe.attr("value") })
        chrome.storage.local.set({ 'options_proxy_server': proxyServer.val() })

        //GitHub
        if ($('#exe_GitHubUP').hasClass('active')) {
          chrome.storage.local.set({ 'options_owner': $("#options_owner").val() })
          chrome.storage.local.set({ 'options_repository': $("#options_repository").val() })
          let PathString = $("#options_UploadPath").val()
          if (!PathString) {
            chrome.storage.local.set({ 'options_UploadPath': "" })
          } else {
            if (/^[a-zA-Z0-9_\/]*$/.test(PathString) === false) {
              toastItem({
                toast_content: '保存失败，上传路径不能含有特殊字符'
              });
              return;
            }
            // 检查输入字符串是否以 '/' 结尾
            if (!PathString.endsWith('/')) {
              PathString = PathString + '/';
            }
            chrome.storage.local.set({ 'options_UploadPath': PathString })
          }
        }


        if ($('#exe_UserDiy').hasClass('active')) {
          //自定义请求
          chrome.storage.local.set({ 'options_apihost': $("#options_apihost").val() })
          chrome.storage.local.set({ 'options_parameter': $("#options_parameter").val() })
          chrome.storage.local.set({ 'options_Headers': $("#options_Headers").val() })
          chrome.storage.local.set({ 'options_Body': $("#options_Body").val() })
          chrome.storage.local.set({ 'options_return_success': $("#options_return_success").val() })
        }
        if ($('#exe_Tencent_COS').hasClass('active')) {
          //腾讯云COS
          chrome.storage.local.set({ 'options_SecretId': $("#options_SecretId").val() })
          chrome.storage.local.set({ 'options_SecretKey': $("#options_SecretKey").val() })
          chrome.storage.local.set({ 'options_Bucket': $("#options_Bucket").val() })
          chrome.storage.local.set({ 'options_AppId': $("#options_AppId").val() })
          chrome.storage.local.set({ 'options_Region': $("#options_Region").val() })
          chrome.storage.local.set({ 'options_Custom_domain_name': $("#options_Custom_domain_name").val() })
          let PathString = $("#options_UploadPath").val()
          if (!PathString) {
            chrome.storage.local.set({ 'options_UploadPath': "" })
          } else {
            if (/^[a-zA-Z0-9_\/]*$/.test(PathString) === false) {
              toastItem({
                toast_content: '保存失败，上传路径不能含有特殊字符'
              });
              return;
            }
            // 检查输入字符串是否以 '/' 结尾
            if (!PathString.endsWith('/')) {
              PathString = PathString + '/';
            }
            chrome.storage.local.set({ 'options_UploadPath': PathString })
          }

          let $options_Custom_domain_name = $("#options_Custom_domain_name").val();
          let httpsPrefix = 'https://';
          let httpPrefix = 'http://';
          let suffix = '/';
          if ($options_Custom_domain_name) {
            // 检查输入字符串是否以 'https://' 开头
            if (!$options_Custom_domain_name.startsWith(httpsPrefix) && !$options_Custom_domain_name.startsWith(httpPrefix)) {
              $options_Custom_domain_name = httpsPrefix + $options_Custom_domain_name;
            }

            // 检查输入字符串是否以 '/' 结尾
            if (!$options_Custom_domain_name.endsWith(suffix)) {
              $options_Custom_domain_name = $options_Custom_domain_name + suffix;
            }
          }
          chrome.storage.local.set({ 'options_Custom_domain_name': $options_Custom_domain_name });

        }
        if ($('#exe_Aliyun_OSS').hasClass('active')) {
          //阿里云OSS
          chrome.storage.local.set({ 'options_SecretId': $("#options_SecretId").val() })
          chrome.storage.local.set({ 'options_SecretKey': $("#options_SecretKey").val() })
          chrome.storage.local.set({ 'options_Bucket': $("#options_Bucket").val() })
          chrome.storage.local.set({ 'options_Endpoint': $("#options_Endpoint").val() })
          chrome.storage.local.set({ 'options_Region': $("#options_Region").val() })
          chrome.storage.local.set({ 'options_Custom_domain_name': $("#options_Custom_domain_name").val() })

          let PathString = $("#options_UploadPath").val()
          if (!PathString) {
            chrome.storage.local.set({ 'options_UploadPath': "" })
          } else {
            if (/^[a-zA-Z0-9_\/]*$/.test(PathString) === false) {
              toastItem({
                toast_content: '保存失败，上传路径不能含有特殊字符'
              });
              return;
            }
            // 检查输入字符串是否以 '/' 结尾
            if (!PathString.endsWith('/')) {
              PathString = PathString + '/';
            }
            chrome.storage.local.set({ 'options_UploadPath': PathString })
          }

          let $options_Custom_domain_name = $("#options_Custom_domain_name").val();
          let httpsPrefix = 'https://';
          let httpPrefix = 'http://';
          let suffix = '/';
          if ($options_Custom_domain_name) {
            // 检查输入字符串是否以 'https://' 开头
            if (!$options_Custom_domain_name.startsWith(httpsPrefix) && !$options_Custom_domain_name.startsWith(httpPrefix)) {
              $options_Custom_domain_name = httpsPrefix + $options_Custom_domain_name;
            }

            // 检查输入字符串是否以 '/' 结尾
            if (!$options_Custom_domain_name.endsWith(suffix)) {
              $options_Custom_domain_name = $options_Custom_domain_name + suffix;
            }
          }
          chrome.storage.local.set({ 'options_Custom_domain_name': $options_Custom_domain_name });

        }
        if ($('#exe_AWS_S3').hasClass('active')) {
          //阿里云OSS
          chrome.storage.local.set({ 'options_SecretId': $("#options_SecretId").val() })
          chrome.storage.local.set({ 'options_SecretKey': $("#options_SecretKey").val() })
          chrome.storage.local.set({ 'options_Bucket': $("#options_Bucket").val() })
          chrome.storage.local.set({ 'options_Region': $("#options_Region").val() })
          chrome.storage.local.set({ 'options_Endpoint': $("#options_Endpoint").val() })

          chrome.storage.local.set({ 'options_Custom_domain_name': $("#options_Custom_domain_name").val() })

          let PathString = $("#options_UploadPath").val()
          if (!PathString) {
            chrome.storage.local.set({ 'options_UploadPath': "" })
          } else {
            if (/^[a-zA-Z0-9_\/]*$/.test(PathString) === false) {
              toastItem({
                toast_content: '保存失败，上传路径不能含有特殊字符'
              });
              return;
            }
            // 检查输入字符串是否以 '/' 结尾
            if (!PathString.endsWith('/')) {
              PathString = PathString + '/';
            }
            chrome.storage.local.set({ 'options_UploadPath': PathString })
          }

          let $options_Custom_domain_name = $("#options_Custom_domain_name").val();
          let httpsPrefix = 'https://';
          let httpPrefix = 'http://';
          let suffix = '/';
          if ($options_Custom_domain_name) {
            // 检查输入字符串是否以 'https://' 开头
            if (!$options_Custom_domain_name.startsWith(httpsPrefix) && !$options_Custom_domain_name.startsWith(httpPrefix)) {
              $options_Custom_domain_name = httpsPrefix + $options_Custom_domain_name;
            }

            // 检查输入字符串是否以 '/' 结尾
            if (!$options_Custom_domain_name.endsWith(suffix)) {
              $options_Custom_domain_name = $options_Custom_domain_name + suffix;
            }
          }
          chrome.storage.local.set({ 'options_Custom_domain_name': $options_Custom_domain_name });

        }
        localStorage.options_webtitle_status = 1
        toastItem({
          toast_content: '保存成功,即将刷新页面'
        })
        setTimeout(function () {
          window.location.reload();
        }, 1000); // 延迟 1.5 秒（1500 毫秒）

      } else {
        toastItem({
          toast_content: '请选择上传程序'
        })
        setTimeout(function () {
          $("#options_save").removeClass('btn-danger');
        }, 2000);

      }
    });


    /**
     * 统一插入CORS元素
     */
    function Insert_CORS_Element() {
      $("#CorsButton button").removeClass("btn-dark")
      $("#CorsButton button").addClass('btn-danger');
      $('#options-form').append(html_exeCORSForm)
      Edit_Box_Animation()
      $('#options_proxy_server').val(options_proxy_server);
      if ($('#options_proxy_server').val() == "undefined") {
        $('#options_proxy_server').val("")
      }
      chrome.storage.local.set({ 'options_proxy_server_state': 1 })
    }
    /**
     * 统一关闭CORS元素
     */
    function Close_CORS_Element() {
      $("#CorsButton button").removeClass("btn-danger")
      $("#CorsButton button").addClass('btn-dark');
      var $options_proxy_server = $('.options_proxy_server').parent()
      $(".CorsForm").slideUp(500, function () {
        $options_proxy_server.remove();
      });// CORS动画
      chrome.storage.local.set({ 'options_proxy_server_state': 0 })
    }

    if (options_proxy_server_state == 1) {
      // 初始化跨域CORS
      Insert_CORS_Element()
    }

    // 开启配置CORS 按钮
    $('#CorsButton').click(function () {
      if ($('#exe_Tencent_COS').hasClass('active')) {
        toastItem({
          toast_content: 'Tencent_COS无法配置CORS代理,请前往官网进行相关配置'
        })
        return;
      }
      if ($('#exe_Aliyun_OSS').hasClass('active')) {
        toastItem({
          toast_content: 'Aliyun_OSS无法配置CORS代理,请前往官网进行相关配置'
        })
        return;
      }
      if ($('#exe_AWS_S3').hasClass('active')) {
        toastItem({
          toast_content: 'AWS_S3无法配置CORS代理,请前往官网进行相关配置'
        })
        return;
      }

      if ($('#CorsButton button').is(".btn-danger")) {
        Close_CORS_Element()
        toastItem({
          toast_content: 'CORS代理关闭成功'
        })

      } else {
        Insert_CORS_Element()
        toastItem({
          toast_content: 'CORS代理开启成功'
        })

      }
    })

    /**
     * 实现开启JSON转换
     */
    function open_json_buttonFn() {
      $('#open_json_button').click(function () {
        if ($('#open_json_button').is(':checked')) {
          chrome.storage.local.set({ 'open_json_button': 1 })
          toastItem({
            toast_content: '开启JSON转换'
          })
        } else {
          chrome.storage.local.set({ 'open_json_button': 0 })
          toastItem({
            toast_content: '关闭JSON转换'
          })
        }
      });
      // 实现控制open_json_button开关
      chrome.storage.local.get(["open_json_button"], function (result) {
        if (result.open_json_button == 1) {
          $('#open_json_button').attr('checked', true);
        }
      })
    }


    $("#Sidebar_area").hover(function () {
      if (!$("#uploadArea_Modal").length) {
        $("body").append(`
        <div class="modal fade" id="uploadArea_Modal" tabindex="-1" aria-labelledby="uploadArea_ModalLabel"
        aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="uploadArea_ModalLabel">区域设置 </h1>&nbsp<span
                style="font-size: 10px; color: #333;">关闭全局上传,侧边栏也会关闭</span>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
        
            <div class="modal-body" id="PNGmodal-body">
              <div id="edit_uploadArea"></div>
              <div style="width: 125px;"></div>
              <div style="width: 250px;">
                <div>
                  <label for="edit_uploadArea_width" class="form-label">宽度:0px</label>
                  <input type="range" class="form-range" min="16" max="100" id="edit_uploadArea_width">
                </div>
                <div>
                  <label for="edit_uploadArea_height" class="form-label">高度:0%</label>
                  <input type="range" class="form-range" min="1" max="100" id="edit_uploadArea_height">
                </div>
                <div>
                  <label for="edit_uploadArea_Location" class="form-label">位置:0</label>
                  <input type="range" class="form-range" min="1" max="100" id="edit_uploadArea_Location" disabled>
                </div>
                <div>
                  <label for="edit_uploadArea_opacity" class="form-label">透明度:0</label>
                  <input type="range" class="form-range" min="5" max="100" id="edit_uploadArea_opacity">
                </div>
                <div>
                  <label for="edit_uploadArea_auto_close_time" class="form-label">关闭时间:2秒</label>
                  <input type="range" class="form-range" min="2" max="100" id="edit_uploadArea_auto_close_time">
                </div>
                <div style="display: flex;">
                  <label for="edit_uploadArea_Left_or_Right" class="form-label" style="margin-right: .5rem;">侧边栏在:</label>
                  <div style="display: flex;">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="edit_uploadArea_Left_or_Right"
                        id="edit_uploadArea_Left">
                      <label class="form-check-label" for="edit_uploadArea_Left_or_Right" style="margin-right: 1rem;">
                        左
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="edit_uploadArea_Left_or_Right"
                        id="edit_uploadArea_Right">
                      <label class="form-check-label" for="edit_uploadArea_Left_or_Right">
                        右
                      </label>
                    </div>
                  </div>
        
                </div>
        
        
              </div>
              <div style="width: 125px;"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="bi bi-x-lg"></i>关闭</button>
              <button type="button" class="btn btn-danger" id="edit_uploadArea_reset" data-bs-dismiss="modal"><i
                  class="bi bi-arrow-repeat"></i>重置</button>
              <button type="button" class="btn btn-primary" id="edit_uploadArea_save"><i
                  class="bi bi-check-lg"></i>保存</button>
            </div>
          </div>
        </div>
        </div>
        `)
      }
    })

    $("#Sidebar_area").click(function () {
      let edit_uploadArea_width_value //宽度
      let edit_uploadArea_height_value //高度
      let edit_uploadArea_Location_value //位置
      let edit_uploadArea_opacity_value //透明度
      let edit_uploadArea_auto_close_time_value //自动关闭时间


      let edit_uploadArea = $("#edit_uploadArea")
      let uploadAreaParent = $("#PNGmodal-body")
      // 定义初始变量
      let isDragging = false;
      let dragStart = 0;
      let dragOffset = 0;
      // 监听鼠标按下事件
      edit_uploadArea.mousedown(function (event) {
        isDragging = true;
        dragStart = event.clientY;
        dragOffset = edit_uploadArea.offset().top - uploadAreaParent.offset().top;
      });
      $(document).mousemove(function (event) {
        let parentHeight = uploadAreaParent.height();
        if (isDragging) {
          let dragPos = event.clientY - dragStart + dragOffset;
          if (dragPos < 0) {
            dragPos = 0;
          }
          if (dragPos > uploadAreaParent.height() - edit_uploadArea.height()) {
            dragPos = uploadAreaParent.height() - edit_uploadArea.height();
          }
          edit_uploadArea_Location_value = parseInt(dragPos / (parentHeight / 100));
          $("#edit_uploadArea_Location").prev('label').text("位置:" + edit_uploadArea_Location_value + "%");
          edit_uploadArea_Location = edit_uploadArea_Location_value
          edit_uploadArea.css("top", dragPos);
          uploadAreaParent.scrollTop(dragPos);
        }
      });

      // 监听鼠标松开事件
      $(document).mouseup(function () {
        isDragging = false;
      });
      // 宽度
      edit_uploadArea.css('width', edit_uploadArea_width + 'px');
      $("#edit_uploadArea_width").attr("value", edit_uploadArea_width)
      $("#edit_uploadArea_width").prev('label').text('宽度:' + edit_uploadArea_width + "px");
      // 高度

      edit_uploadArea.css('height', edit_uploadArea_height + '%');
      $("#edit_uploadArea_height").attr("value", edit_uploadArea_height)
      $("#edit_uploadArea_height").prev('label').text('高度:' + edit_uploadArea_height + "%");
      switch (edit_uploadArea_Left_or_Right) {
        case 'Left':
          if (edit_uploadArea_height > 99) {
            edit_uploadArea.css("border-radius", "0px 10px 10px 0px")
          } else {
            edit_uploadArea.css("border-radius", "0")
          }
          break;
        case 'Right':
          if (edit_uploadArea_height > 99) {
            edit_uploadArea.css("border-radius", "10px 0px 0px 10px")
          } else {
            edit_uploadArea.css("border-radius", "0")
          }
          break;
      }

      //位置
      edit_uploadArea.css('top', (edit_uploadArea_Location * ($("#PNGmodal-body").height() / 100)) + 'px');
      $("#edit_uploadArea_Location").attr("value", edit_uploadArea_Location)
      $("#edit_uploadArea_Location").prev('label').text('位置:' + (edit_uploadArea_Location) + "%");

      //透明
      edit_uploadArea.css("background-color", `rgba(60,64,67,` + edit_uploadArea_opacity + `)`)
      $("#edit_uploadArea_opacity").attr("value", edit_uploadArea_opacity * 100)
      $("#edit_uploadArea_opacity").prev('label').text('透明度:' + edit_uploadArea_opacity);

      //自动关闭时间
      $("#edit_uploadArea_auto_close_time").attr("value", edit_uploadArea_auto_close_time)
      $("#edit_uploadArea_auto_close_time").prev('label').text('关闭时间:' + edit_uploadArea_auto_close_time + "秒");
      switch (edit_uploadArea_Left_or_Right) {
        case 'Left':
          $("#edit_uploadArea_Left").attr("checked", true)
          edit_uploadArea.css("left", "0");
          break;
        case 'Right':
          $("#edit_uploadArea_Right").attr("checked", true)
          edit_uploadArea.css("right", "0");
          break;
      }


      $("#edit_uploadArea_Left").click(function () {
        chrome.storage.local.set({ "edit_uploadArea_Left_or_Right": "Left" })
        edit_uploadArea_Left_or_Right = "Left"
        edit_uploadArea.css("left", "0");
        if (edit_uploadArea_height > 99) {
          edit_uploadArea.css("border-radius", "0px 10px 10px 0px")
        } else {
          edit_uploadArea.css("border-radius", "0")
        }
      })
      $("#edit_uploadArea_Right").click(function () {
        chrome.storage.local.set({ "edit_uploadArea_Left_or_Right": "Right" })
        edit_uploadArea_Left_or_Right = "Right"
        edit_uploadArea.css("left", uploadAreaParent.width() - edit_uploadArea.width() + "px");
        if (edit_uploadArea_height > 99) {
          edit_uploadArea.css("border-radius", "10px 0px 0px 10px")
        } else {
          edit_uploadArea.css("border-radius", "0")
        }
      })


      $('#edit_uploadArea_width').on('input', function () {
        edit_uploadArea_width_value = $(this).val();
        $(this).prev('label').text('宽度:' + edit_uploadArea_width_value + "px");
        edit_uploadArea.css('width', edit_uploadArea_width_value + 'px');
        edit_uploadArea_width = edit_uploadArea_width_value
        switch (edit_uploadArea_Left_or_Right) {
          case 'Right':
            edit_uploadArea.css('left', uploadAreaParent.width() - edit_uploadArea_width_value + 'px');
            break;
        }
      });



      $('#edit_uploadArea_height').on('input', function () {
        edit_uploadArea_height_value = $(this).val();
        let areaOffset = edit_uploadArea.offset();
        let parentOffset = edit_uploadArea.parent().offset();
        let top = areaOffset.top - parentOffset.top;
        let parentHeight = edit_uploadArea.parent().height();

        edit_uploadArea_Location_value = parseInt((top / parentHeight) * 100);
        let from_border = edit_uploadArea_Location_value + parseInt(edit_uploadArea_height_value)
        $(this).prev('label').text('高度:' + edit_uploadArea_height_value + "%");
        $("#edit_uploadArea_Location").prev('label').text('位置:' + edit_uploadArea_Location_value + "%");
        if (from_border > 99) {
          edit_uploadArea.css("top", 0)
        }

        switch (edit_uploadArea_Left_or_Right) {
          case 'Left':
            if (edit_uploadArea_height_value > 99) {
              edit_uploadArea.css("border-radius", "0px 10px 10px 0px")
            } else {
              edit_uploadArea.css("border-radius", "0")
            }
            break;
          case 'Right':
            if (edit_uploadArea_height_value > 99) {
              edit_uploadArea.css("border-radius", "10px 0px 0px 10px")
            } else {
              edit_uploadArea.css("border-radius", "0")
            }
            break;
        }




        edit_uploadArea.css('height', edit_uploadArea_height_value + '%');
        edit_uploadArea_height = edit_uploadArea_height_value
        edit_uploadArea_Location = edit_uploadArea_Location_value

      });


      $('#edit_uploadArea_opacity').on('input', function () {
        edit_uploadArea_opacity_value = $(this).val() / 100;
        $("#edit_uploadArea_opacity").prev('label').text('透明度:' + edit_uploadArea_opacity_value);
        edit_uploadArea.css("background-color", `rgba(60,64,67,` + edit_uploadArea_opacity_value + `)`)
        edit_uploadArea_opacity = edit_uploadArea_opacity_value
      });

      $('#edit_uploadArea_auto_close_time').on('input', function () {
        edit_uploadArea_auto_close_time_value = $(this).val();
        $("#edit_uploadArea_auto_close_time").prev('label').text('关闭时间:' + edit_uploadArea_auto_close_time_value + "秒");
        edit_uploadArea_auto_close_time = edit_uploadArea_auto_close_time_value
      });


      $("#edit_uploadArea_save").click(function () {
        chrome.storage.local.set({ "edit_uploadArea_width": edit_uploadArea_width_value })
        chrome.storage.local.set({ "edit_uploadArea_height": edit_uploadArea_height_value })
        chrome.storage.local.set({ "edit_uploadArea_Location": edit_uploadArea_Location_value })
        chrome.storage.local.set({ "edit_uploadArea_opacity": edit_uploadArea_opacity_value })
        chrome.storage.local.set({ "edit_uploadArea_auto_close_time": edit_uploadArea_auto_close_time_value })
        toastItem({
          toast_content: '保存成功,刷新页面生效'
        })

      })
      $("#edit_uploadArea_reset").click(function () {
        chrome.storage.local.set({ "edit_uploadArea_width": 32 })
        chrome.storage.local.set({ "edit_uploadArea_height": 30 })
        chrome.storage.local.set({ "edit_uploadArea_Location": 34 })
        chrome.storage.local.set({ "edit_uploadArea_opacity": 0.3 })
        chrome.storage.local.set({ "edit_uploadArea_auto_close_time": 2 })
        chrome.storage.local.set({ "edit_uploadArea_Left_or_Right": "Right" })
        toastItem({
          toast_content: '重置成功,刷新页面生效'
        })

      })

    })

  })//chrome get


  $("#options_exe button").click(function () {
    $("#options_exe button").removeClass('active'); // 删除所有a标签的active类
    $(this).addClass('active'); // 给当前点击的a标签添加active类
  });

  // 修复初始化时输入框读取到undefined
  let optionsNull = ['#options_host', '#options_token', '#options_uid'];
  optionsNull.forEach(function (option) {
    if ($(option).val() == "undefined") {
      $(option).val("")
    }
  });

  // 写入标题
  var options_webtitle = localStorage.options_webtitle
  $(".title-a").text(options_webtitle)

  // 初始化底部打开方式
  chrome.storage.local.get(["browser_Open_with"], function (result) {
    let button = $("#options_Open_withDiv button")
    if (result.browser_Open_with === 1) {
      //在标签页打开
      $("#options_Open_with_Tab a").addClass('active');
      button.text($("#options_Open_with_Tab a").text())
    }
    if (result.browser_Open_with === 2) {
      $("#options_Open_with_Window a").addClass('active');
      button.text($("#options_Open_with_Window a").text())
    }
    if (result.browser_Open_with === 3) {
      $("#options_Open_with_Inside a").addClass('active');
      button.text($("#options_Open_with_Inside a").text())
    }
  });

  // 实现配置打开方式
  $('#options_Open_with_Tab').click(function () {
    chrome.storage.local.set({ 'browser_Open_with': 1 }, function () {
      // 打开方式为：在标签页打开
    });
    chrome.runtime.reload();
  });
  $('#options_Open_with_Window').click(function () {
    chrome.storage.local.set({ 'browser_Open_with': 2 }, function () {
      // 打开方式为：在新窗口打开
    });
    chrome.runtime.reload();
  });
  $('#options_Open_with_Inside').click(function () {
    alert('使用内置页打开，第一使用需要点击两次插件！')
    chrome.storage.local.set({ 'browser_Open_with': 3 }, function () {
      // 打开方式为：在内置页打开
    });
    chrome.runtime.reload();
  });

  chrome.storage.local.get(["GlobalUpload"], function (result) {
    if ($('a[value="' + result.GlobalUpload + '"]').length) {
      $('a[value="' + result.GlobalUpload + '"]').addClass("active")
    } else {
      chrome.storage.local.set({ "GlobalUpload": "GlobalUpload_off" })
      $('a[value="GlobalUpload_off"]').addClass("active")
    }
    if (result.GlobalUpload == "GlobalUpload_Default") {
      $("#GlobalUpload button").addClass("btn-primary")
    } else if (result.GlobalUpload == "GlobalUpload_off") {
      $("#GlobalUpload button").addClass("btn-dark")
    }


    $('#GlobalUpload .dropdown-item').click(function () {
      let val = $(this).attr("value")
      $("#GlobalUpload button").removeClass("btn-primary btn-danger btn-dark")
      if (val == "GlobalUpload_Default") {
        $("#GlobalUpload button").addClass("btn-primary")
      } else if (val == "GlobalUpload_off") {
        $("#GlobalUpload button").addClass("btn-dark")
      }

      chrome.storage.local.set({ "GlobalUpload": val })
      $('#GlobalUpload .dropdown-item').removeClass("active")
      $(this).addClass("active")
    });
  })
  chrome.storage.local.get(["AutoInsert"], function (result) {
    if ($('a[value="' + result.AutoInsert + '"]').length) {
      $('a[value="' + result.AutoInsert + '"]').addClass("active")
    } else {
      chrome.storage.local.set({ "AutoInsert": "AutoInsert_off" })
      $('a[value="AutoInsert_off"]').addClass("active")
    }
    if (result.AutoInsert == "AutoInsert_on") {
      $("#AutoInsert button").addClass("btn-primary")
    } else if (result.AutoInsert == "AutoInsert_off") {
      $("#AutoInsert button").addClass("btn-dark")
    }


    $('#AutoInsert .dropdown-item').click(function () {
      let val = $(this).attr("value")
      $("#AutoInsert button").removeClass("btn-primary btn-dark")
      if (val == "AutoInsert_on") {
        toastItem({
          toast_content: "开启成功,请手动刷新页面再上传"
        });
        $("#AutoInsert button").addClass("btn-primary")
      } else if (val == "AutoInsert_off") {
        $("#AutoInsert button").addClass("btn-dark")
      }

      chrome.storage.local.set({ "AutoInsert": val })
      $('#AutoInsert .dropdown-item').removeClass("active")
      $(this).addClass("active")
    });
  })

  chrome.storage.local.get(["Right_click_menu_upload"], function (result) {
    if (result.Right_click_menu_upload == "on") {
      $('#Right_click_menu_upload').attr('checked', true);
    }
    //右键上传
    $('#Right_click_menu_upload').click(function () {
      if ($('#Right_click_menu_upload').is(':checked')) {
        chrome.storage.local.set({ "Right_click_menu_upload": "on" })
      } else {
        chrome.storage.local.set({ "Right_click_menu_upload": "off" })
      }
      chrome.runtime.reload();
    });
  })



  animation_button('.Animation_button')
});

