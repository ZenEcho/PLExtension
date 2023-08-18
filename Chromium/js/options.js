const overlayElement = $(`.overlay`);
$(document).ready(function () {
  // 删除a标签的active达到初始化的目的
  $("#options_exe button").removeClass('active');
  chrome.storage.local.get(storagelocal, function (result) {
    // 获取程序以及状态
    options_exe = result.options_exe
    options_proxy_server_state = result.options_proxy_server_state
    options_proxy_server = result.options_proxy_server
    options_host = result.options_host
    options_token = result.options_token
    options_uid = result.options_uid
    options_source = result.options_source
    options_imgur_post_mode = result.options_imgur_post_mode
    options_expiration_select = result.options_expiration_select || "NODEL"
    options_album_id = result.options_album_id
    options_nsfw_select = result.options_nsfw_select || 0
    options_permission_select = result.options_permission_select || 0

    //自定义请求
    options_apihost = result.options_apihost
    options_parameter = result.options_parameter
    options_Headers = result.options_Headers
    options_Body = result.options_Body
    options_return_success = result.options_return_success
    open_json_button = result.open_json_button

    //GitHub
    options_owner = result.options_owner
    options_repository = result.options_repository

    //对象存储
    options_SecretId = result.options_SecretId
    options_SecretKey = result.options_SecretKey
    options_Bucket = result.options_Bucket
    options_AppId = result.options_AppId
    options_Endpoint = result.options_Endpoint
    options_Region = result.options_Region
    options_UploadPath = result.options_UploadPath
    options_Custom_domain_name = result.options_Custom_domain_name

    //自定义图标区域
    edit_uploadArea_width = result.edit_uploadArea_width
    edit_uploadArea_height = result.edit_uploadArea_height
    edit_uploadArea_Location = result.edit_uploadArea_Location
    edit_uploadArea_opacity = result.edit_uploadArea_opacity
    edit_uploadArea_auto_close_time = result.edit_uploadArea_auto_close_time
    edit_uploadArea_Left_or_Right = result.edit_uploadArea_Left_or_Right
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
      <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_lsky") + `" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token") + `
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="` + chrome.i18n.getMessage("options_token_placeholder_lsky") + `" />
    </div>
    <div class="form-group">
      <label for="options_album_id" class="options_album_id">` + chrome.i18n.getMessage("options_album_id") + `</label>
      <select id="options_album_id" class="form-select box-shadow">
      
      </select>
    </div>
    <div class="form-group">
      <label for="options_permission" class="options_permission">` + chrome.i18n.getMessage("options_permission") + `
      </label>
      <select id="options_permission_select" class="form-select box-shadow">
      <option selected value="0">` + chrome.i18n.getMessage("options_permission_0") + `</option>
      <option value="1">` + chrome.i18n.getMessage("options_permission_1") + `</option>
      </select>                
    </div>
    <div class="form-group">
      <label for="options_source" class="options_source">` + chrome.i18n.getMessage("options_source_lsky") + `
      </label>
      <select id="options_source_select" class="form-select box-shadow">
      </select>
    </div>
  `

    const html_exeEasyImagesBox = `
<div class="form-group">
    <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
    </label>
    <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_EasyImages") + `" />
  </div>
  <div class="form-group">
    <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token") + `
    </label>
      <input type="text" class="form-control box-shadow" id="options_token"
                placeholder="` + chrome.i18n.getMessage("options_token_placeholder_EasyImages") + `" />
  </div>`

    const html_exeImgURLBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_ImgURL") + `" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token") + `
      </label>
      <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="` + chrome.i18n.getMessage("options_token_placeholder_ImgURL") + `" />
    </div>
    <div class="form-group">
      <label for="options_uid" class="options_uid">` + chrome.i18n.getMessage("options_uid") + `
      </label>
      <input type="text" class="form-control box-shadow" id="options_uid" placeholder="` + chrome.i18n.getMessage("options_uid_placeholder") + `" />
    </div>
    `
    const html_exeSM_MSBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_SM_MS") + `" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token") + `
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="` + chrome.i18n.getMessage("options_token_placeholder_SM_MS") + `" />
    </div>`

    const html_exeCheveretoBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_Chevereto") + `" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token") + `
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="` + chrome.i18n.getMessage("options_token_placeholder_Chevereto") + `" />
    </div>
    <div class="form-group">
      <label for="options_album_id" class="options_album_id">` + chrome.i18n.getMessage("options_album_id_Chevereto") + `
      </label>
        <input type="text" class="form-control box-shadow" id="options_album_id"
                  placeholder="` + chrome.i18n.getMessage("options_album_id_placeholder_Chevereto") + `" />
    </div>
    <div class="form-group">
      <label for="options_nsfw" class="options_nsfw">` + chrome.i18n.getMessage("options_nsfw") + `
      </label>
      <select id="options_nsfw_select" class="form-select box-shadow">
      <option selected value="0">` + chrome.i18n.getMessage("options_nsfw_0") + `</option>
      <option value="1">` + chrome.i18n.getMessage("options_nsfw_1") + `</option>
      </select>                
    </div>
    <div class="form-group">
    <label for="options_expiration" class="options_expiration">` + chrome.i18n.getMessage("options_expiration") + `
    </label>
    <select id="options_expiration_select" class="form-select box-shadow">
    <option selected value="NODEL">` + chrome.i18n.getMessage("options_expiration_no") + `</option>
    <option value="PT5M">` + chrome.i18n.getMessage("options_expiration_1") + `</option>
    <option value="PT15M">` + chrome.i18n.getMessage("options_expiration_2") + `</option>
    <option value="PT30M">` + chrome.i18n.getMessage("options_expiration_3") + `</option>
    <option value="PT1H">` + chrome.i18n.getMessage("options_expiration_4") + `</option>
    <option value="PT3H">` + chrome.i18n.getMessage("options_expiration_5") + `</option>
    <option value="PT6H">` + chrome.i18n.getMessage("options_expiration_6") + `</option>
    <option value="PT12H">` + chrome.i18n.getMessage("options_expiration_7") + `</option>
    <option value="P1D">` + chrome.i18n.getMessage("options_expiration_8") + `</option>
    <option value="P2D">` + chrome.i18n.getMessage("options_expiration_9") + `</option>
    <option value="P3D">` + chrome.i18n.getMessage("options_expiration_10") + `</option>
    <option value="P4D">` + chrome.i18n.getMessage("options_expiration_11") + `</option>
    <option value="P5D">` + chrome.i18n.getMessage("options_expiration_12") + `</option>
    <option value="P6D">` + chrome.i18n.getMessage("options_expiration_13") + `</option>
    <option value="P1W">` + chrome.i18n.getMessage("options_expiration_14") + `</option>
    <option value="P2W">` + chrome.i18n.getMessage("options_expiration_15") + `</option>
    <option value="P3W">` + chrome.i18n.getMessage("options_expiration_16") + `</option>
    <option value="P1M">` + chrome.i18n.getMessage("options_expiration_17") + `</option>
    <option value="P2M">` + chrome.i18n.getMessage("options_expiration_18") + `</option>
    <option value="P3M">` + chrome.i18n.getMessage("options_expiration_19") + `</option>
    <option value="P4M">` + chrome.i18n.getMessage("options_expiration_20") + `</option>
    <option value="P5M">` + chrome.i18n.getMessage("options_expiration_21") + `</option>
    <option value="P6M">` + chrome.i18n.getMessage("options_expiration_22") + `</option>
    <option value="P1Y">` + chrome.i18n.getMessage("options_expiration_23") + `</option>
    </select>
    </div>
    `
    const html_exeCORSForm = `
  <div class="form-group CorsForm">
    <label for="options_proxy_server" class="options_proxy_server">` + chrome.i18n.getMessage("options_proxy_server") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_proxy_server" placeholder="` + chrome.i18n.getMessage("options_proxy_server_placeholder") + `" />
  </div>`


    const html_exe_HellohaoBox = `
  <div class="form-group">
      <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
      </label>
      <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_Hellohao") + `" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token") + `
      </label>
        <input type="text" class="form-control box-shadow" id="options_token"
                  placeholder="` + chrome.i18n.getMessage("options_token_placeholder_Hellohao") + `" />
    </div>
    <div class="form-group">
      <label for="options_source" class="options_source">` + chrome.i18n.getMessage("options_source_Hellohao") + `
      </label>
      <input type="text" class="form-control box-shadow" id="options_source" placeholder="` + chrome.i18n.getMessage("options_source_placeholder_Hellohao") + `" />
    </div>
    `
    const html_exe_ImgurBox = `
  <div class="form-group">
  <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
  </label>
  <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_Imgur") + `" />
</div>
<div class="form-group">
  <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token_Imgur") + `
  </label>
  <input type="text" class="form-control box-shadow" id="options_token" placeholder="` + chrome.i18n.getMessage("options_token_placeholder_Imgur") + `" />
</div>
<div class="ImgurPostModeDiv " style="text-align: center;">Image
  <label class="switch">
    <input id="options_imgur_post_mode" type="checkbox">
    <div class="slider round"></div>
  </label>video
</div>
    `
    const html_exe_UserDiyBox = `
  <div class="form-group">
  <label for="options_apihost" class="options_apihost">` + chrome.i18n.getMessage("options_apihost") + `</p>
  </label>
  <input type="url" class="form-control box-shadow" id="options_apihost" placeholder="` + chrome.i18n.getMessage("options_apihost_placeholder") + `" />
</div>
<div class="form-group">
  <label for="options_parameter" class="options_parameter">` + chrome.i18n.getMessage("options_parameter") + `
  </label>
  <input type="text" class="form-control box-shadow" id="options_parameter" placeholder="` + chrome.i18n.getMessage("options_parameter_placeholder") + `" />
</div>
<div class="form-group">
  <label for="options_Headers" class="options_Headers">` + chrome.i18n.getMessage("options_Headers") + `
  </label>
  <div class="form-floating">
    <textarea class="form-control box-shadow" id="options_Headers"></textarea>
    <label for="floatingTextarea">` + chrome.i18n.getMessage("options_Headers_floatingTextarea") + `</label>
  </div>
</div>
<div class="form-group">
  <label for="options_Body" class="options_Body">` + chrome.i18n.getMessage("options_Body") + `
  </label>
  <div class="form-floating">
    <textarea class="form-control box-shadow" id="options_Body"></textarea>
    <label for="floatingTextarea">` + chrome.i18n.getMessage("options_Body_floatingTextarea") + `</label>
  </div>
</div>

<div class="form-group">
  <label for="options_Body" class="options_return_success">` + chrome.i18n.getMessage("options_return_success") + `
  </label>
  <input type="text" class="form-control box-shadow" id="options_return_success" placeholder="` + chrome.i18n.getMessage("options_return_success_placeholder") + `" />
  <div class="form-check form-switch" style="margin-top: 1rem;">
   <input class="form-check-input" type="checkbox" role="switch" id="open_json_button">
   <label class="form-check-label" for="flexSwitchCheckDefault">` + chrome.i18n.getMessage("open_json_button") + `</label>
  </div>

  </div>
    `
    const html_exe_GitHubUP = `
    <div class="form-group">
      <label for="options_owner" class="options_owner">` + chrome.i18n.getMessage("options_owner") + `
      </label>
      <input type="url" class="form-control box-shadow" id="options_owner" placeholder="` + chrome.i18n.getMessage("options_owner_placeholder") + `" />
    </div>
    <div class="form-group">
      <label for="options_repository" class="options_repository">` + chrome.i18n.getMessage("options_repository") + `
      </label>
      <input type="text" class="form-control box-shadow" id="options_repository" placeholder="` + chrome.i18n.getMessage("options_repository_placeholder") + `" />
    </div>
    <div class="form-group">
      <label for="options_UploadPath" class="options_UploadPath">` + chrome.i18n.getMessage("options_UploadPath") + `
      </label>
      <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="` + chrome.i18n.getMessage("options_UploadPath_placeholder") + `" />
    </div>
    <div class="form-group">
      <label for="options_token" class="options_token ">` + chrome.i18n.getMessage("options_token_GitHub") + `
      </label>
      <input type="text" class="form-control box-shadow" id="options_token" placeholder="` + chrome.i18n.getMessage("options_token_placeholder_GitHub") + `" />
    </div>
    <div class="alert alert-warning" role="alert">
    ` + chrome.i18n.getMessage("options_GitHub_Warning") + `
    </div>
      `

    const html_exeTencent_COS = `
  <div class="form-group">
    <label for="options_SecretId" class="options_SecretId">` + chrome.i18n.getMessage("options_SecretId_COS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_SecretId" placeholder="` + chrome.i18n.getMessage("options_SecretId_placeholder_COS") + `" />
  </div>
  <div class="form-group">
    <label for="options_SecretKey" class="options_SecretKey">` + chrome.i18n.getMessage("options_SecretKey_COS") + `
    </label>
    <input type="password" class="form-control box-shadow" id="options_SecretKey" placeholder="` + chrome.i18n.getMessage("options_SecretKey_placeholder_COS") + `" />
  </div>
  <div class="form-group">
    <label for="options_Bucket" class="options_Bucket">` + chrome.i18n.getMessage("options_Bucket_COS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Bucket" placeholder="` + chrome.i18n.getMessage("options_Bucket_placeholder_COS") + `" />
  </div>
  <div class="form-group">
    <label for="options_AppId" class="options_AppId">` + chrome.i18n.getMessage("options_AppId_COS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_AppId" placeholder="` + chrome.i18n.getMessage("options_AppId_placeholder_COS") + `" />
  </div>
  <div class="form-group">
    <label for="options_Region" class="options_Region">` + chrome.i18n.getMessage("options_Region_COS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Region" placeholder="` + chrome.i18n.getMessage("options_Region_placeholder_COS") + `" />
  </div>
  <div class="form-group">
    <label for="options_UploadPath" class="options_UploadPath">` + chrome.i18n.getMessage("options_UploadPath") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="` + chrome.i18n.getMessage("options_UploadPath_placeholder") + `" />
  </div>
  <div class="form-group">
    <label for="options_Custom_domain_name" class="options_Custom_domain_name">` + chrome.i18n.getMessage("options_Custom_domain_name_COS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Custom_domain_name" placeholder="` + chrome.i18n.getMessage("options_Custom_domain_name_placeholder") + `" />
  </div>
  `
    const cos_cors = `
  <div class="CorsButton" id="Object_Storage_cors">
  <button type="button" class="css-button-rounded--sky">` + chrome.i18n.getMessage("Object_Storage_cors_COS") + `</button>
  </div>
  `
    const cos_putBucketACL = `
  <div class="CorsButton" id="putBucketACL">
    <button type="button" class="css-button-arrow--sky putBucketACL" data-bs-toggle="dropdown" aria-expanded="false">
    ` + chrome.i18n.getMessage("putBucketACL") + `
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#" value="private"><i class="bi bi-incognito"></i>` + chrome.i18n.getMessage("putBucketACL_1") + `</a></li>
      <li><a class="dropdown-item" href="#" value="public-read"><i class="bi bi-file-earmark-lock"></i>` + chrome.i18n.getMessage("putBucketACL_2") + `</a></li>
      <li><a class="dropdown-item" href="#" value="public-read-write"><i class="bi bi-folder2-open"></i>` + chrome.i18n.getMessage("putBucketACL_3") + `</a></li>
    </ul>
  </div>
  `

    const html_exeAliyun_OSS = `
  <div class="form-group">
    <label for="options_SecretId" class="options_SecretId">` + chrome.i18n.getMessage("options_SecretId_OSS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_SecretId" placeholder="` + chrome.i18n.getMessage("options_SecretId_placeholder_OSS") + `" />
  </div>
  <div class="form-group">
    <label for="options_SecretKey" class="options_SecretKey">` + chrome.i18n.getMessage("options_SecretKey_OSS") + `
    </label>
    <input type="password" class="form-control box-shadow" id="options_SecretKey" placeholder="` + chrome.i18n.getMessage("options_SecretKey_placeholder_OSS") + `" />
  </div>
  <div class="form-group">
    <label for="options_Bucket" class="options_Bucket">` + chrome.i18n.getMessage("options_Bucket_OSS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Bucket" placeholder="` + chrome.i18n.getMessage("options_Bucket_placeholder_OSS") + `" />
  </div>
  <div class="form-group">
    <label for="options_Endpoint" class="options_Endpoint">` + chrome.i18n.getMessage("options_Endpoint_OSS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Endpoint" placeholder="` + chrome.i18n.getMessage("options_Endpoint_placeholder_OSS") + `" />
  </div>
  <div class="form-group">
    <label for="options_Region" class="options_Region">` + chrome.i18n.getMessage("options_Region_OSS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Region" placeholder="` + chrome.i18n.getMessage("options_Region_placeholder_OSS") + `" />
  </div>
  <div class="form-group">
    <label for="options_UploadPath" class="options_UploadPath">` + chrome.i18n.getMessage("options_UploadPath") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="` + chrome.i18n.getMessage("options_UploadPath_placeholder_OSS") + `" />
  </div>
  <div class="form-group">
    <label for="options_Custom_domain_name" class="options_Custom_domain_name">` + chrome.i18n.getMessage("options_Custom_domain_name_OSS") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Custom_domain_name" placeholder="` + chrome.i18n.getMessage("options_Custom_domain_name_placeholder") + `" />
  </div>
  `
    const oss_cors = ` 
  <div class="CorsButton" id="Object_Storage_cors">
    <button type="button" class="css-button-rounded--sky">` + chrome.i18n.getMessage("Object_Storage_cors_OSS") + `</button>
    </div>
    `
    const oss_putBucketACL = `
    <div class="CorsButton" id="putBucketACL">
      <button type="button" class="css-button-arrow--sky putBucketACL" data-bs-toggle="dropdown" aria-expanded="false">
      ` + chrome.i18n.getMessage("putBucketACL") + `
      </button>
      <ul class="dropdown-menu">
        <li><a class="dropdown-item" href="#" value="private"><i class="bi bi-incognito"></i>` + chrome.i18n.getMessage("putBucketACL_1") + `</a></li>
        <li><a class="dropdown-item" href="#" value="public-read"><i class="bi bi-file-earmark-lock"></i>` + chrome.i18n.getMessage("putBucketACL_2") + `</a></li>
        <li><a class="dropdown-item" href="#" value="public-read-write"><i class="bi bi-folder2-open"></i>` + chrome.i18n.getMessage("putBucketACL_3") + `</a></li>
      </ul>
    </div>
  `

    const html_exeAWS_S3 = `
  <div class="form-group">
    <label for="options_SecretId" class="options_SecretId">` + chrome.i18n.getMessage("options_SecretId_S3") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_SecretId" placeholder="` + chrome.i18n.getMessage("options_SecretId_placeholder_S3") + `" />
  </div>
  <div class="form-group">
    <label for="options_SecretKey" class="options_SecretKey">` + chrome.i18n.getMessage("options_SecretKey_S3") + `
    </label>
    <input type="password" class="form-control box-shadow" id="options_SecretKey" placeholder="` + chrome.i18n.getMessage("options_SecretKey_placeholder_S3") + `" />
  </div>
  <div class="form-group">
    <label for="options_Bucket" class="options_Bucket">` + chrome.i18n.getMessage("options_Bucket_S3") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Bucket" placeholder="` + chrome.i18n.getMessage("options_Bucket_placeholder_S3") + `" />
  </div>
  <div class="form-group">
    <label for="options_Region" class="options_Region">` + chrome.i18n.getMessage("options_Region_S3") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Region" placeholder="` + chrome.i18n.getMessage("options_Region_placeholder_S3") + `" />
  </div>
  <div class="form-group">
    <label for="options_Endpoint" class="options_Endpoint">` + chrome.i18n.getMessage("options_Endpoint_S3") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Endpoint" placeholder="` + chrome.i18n.getMessage("options_Endpoint_placeholder_S3") + `" />
  </div>
  <div class="form-group">
    <label for="options_UploadPath" class="options_UploadPath">` + chrome.i18n.getMessage("options_UploadPath") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_UploadPath" placeholder="` + chrome.i18n.getMessage("options_UploadPath_placeholder") + `" />
  </div>
  <div class="form-group">
    <label for="options_Custom_domain_name" class="options_Custom_domain_name">` + chrome.i18n.getMessage("options_Custom_domain_name_S3") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Custom_domain_name" placeholder="` + chrome.i18n.getMessage("options_Custom_domain_name_placeholder_S3") + `" />
  </div>
  `
    const s3_cors = ` 
  <div class="CorsButton" id="Object_Storage_cors">
    <button type="button" class="css-button-rounded--sky">` + chrome.i18n.getMessage("Object_Storage_cors_S3") + `</button>
    </div>
    `

    const html_exe_Telegra_ph = `
    <div class="alert alert-success" role="alert">
      <h4 class="alert-heading">` + chrome.i18n.getMessage("Telegra_ph_1") + `</h4>
      <p>` + chrome.i18n.getMessage("Telegra_ph_2") + `</p>
      <hr>
      <p class="mb-0">` + chrome.i18n.getMessage("Telegra_ph_3") + `</p>
    </div>
    <div class="form-group">
    <label for="options_Custom_domain_name" class="options_Custom_domain_name">` + chrome.i18n.getMessage("options_Custom_domain_name_Telegra_ph") + `
    </label>
    <input type="text" class="form-control box-shadow" id="options_Custom_domain_name" placeholder="` + chrome.i18n.getMessage("options_Custom_domain_name_placeholder_Telegra_ph") + `" />
    </div>
      `
    const html_exe_Telegra_phBoxBottom_Tipsa = `生活原本苦闷，但跑起来就会生风`

    const html_exe_imgdd = `
      <div class="form-group">
        <label for="options_host" class="options_host">` + chrome.i18n.getMessage("options_host") + `
        </label>
        <input type="url" class="form-control box-shadow" id="options_host" placeholder="` + chrome.i18n.getMessage("options_host_placeholder_imgdd") + `" value="imgdd.com"/>
      </div>
    `
    let optionsProg = {
      '#exe_Lsky': {
        'needUid': 1,
        'html_exeBox': html_exeLskyBox,
      },
      '#exe_EasyImages': {
        'needUid': 2,
        'html_exeBox': html_exeEasyImagesBox,
      },
      '#exe_ImgURL': {
        'needUid': 3,
        'html_exeBox': html_exeImgURLBox,
      },
      '#exe_SM_MS': {
        'needUid': 4,
        'html_exeBox': html_exeSM_MSBox,
      },
      '#exe_Chevereto': {
        'needUid': 5,
        'html_exeBox': html_exeCheveretoBox,
      },
      '#exe_Hellohao': {
        'needUid': 6,
        'html_exeBox': html_exe_HellohaoBox,
      },
      '#exe_Imgur': {
        'needUid': 7,
        'html_exeBox': html_exe_ImgurBox,
      },
      '#exe_UserDiy': {
        'needUid': 8,
        'html_exeBox': html_exe_UserDiyBox,
      },
      '#exe_Tencent_COS': {
        'needUid': 9,
        'html_exeBox': html_exeTencent_COS,
      },
      '#exe_Aliyun_OSS': {
        'needUid': 10,
        'html_exeBox': html_exeAliyun_OSS,
      },
      '#exe_AWS_S3': {
        'needUid': 11,
        'html_exeBox': html_exeAWS_S3,
      },
      '#exe_GitHubUP': {
        'needUid': 12,
        'html_exeBox': html_exe_GitHubUP,
      },
      '#exe_Telegra_ph': {
        'needUid': 13,
        'html_exeBox': html_exe_Telegra_ph,
      },
      "#exe_imgdd": {
        'needUid': 14,
        'html_exeBox': html_exe_imgdd,
      },
      'default': {
        'body': `
      <div class="alert alert-secondary" role="alert">
        <h4 class="alert-heading">` + chrome.i18n.getMessage("Program_selection_instructions_1") + `</h4>
        <p>` + chrome.i18n.getMessage("Program_selection_instructions_2") + `</p>
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
          <img src="https://cdn-us.imgs.moe/2023/07/04/64a414574dba6.gif" class="d-block w-100">
          <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
            <h1>` + chrome.i18n.getMessage("You_know_what") + `</h1>
            <p>` + chrome.i18n.getMessage("You_know_what_1") + `</p>
          </div>
        </div>
        <div class="carousel-item">
          <img src="https://cdn-us.imgs.moe/2023/07/04/64a4145276e67.gif" class="d-block w-100" loading="lazy">
          <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
            <h1>` + chrome.i18n.getMessage("You_know_what") + `</h1>
            <p>` + chrome.i18n.getMessage("You_know_what_2") + `</p>
          </div>
        </div>
        <div class="carousel-item">
          <img src="https://cdn-us.imgs.moe/2023/07/04/64a414475a4ec.gif" class="d-block w-100" loading="lazy">
          <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
            <h1>` + chrome.i18n.getMessage("You_know_what") + `</h1>
            <p>` + chrome.i18n.getMessage("You_know_what_3") + `</p>
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
    function Input_box_loading() {
      let prog = optionsProg['#exe_' + options_exe];
      // 加载元素配置
      if (!prog) {
        prog = optionsProg["default"]
        $("#options-form").append(prog.body)
      } else {
        $('#options-form').append(prog.html_exeBox);
        Edit_Box_Animation()
        // $('.text-bottom-Tips1').html(prog.bottomTips);
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
        case 'Telegra_ph':
          $("#exe_Telegra_ph").addClass('active');
          $("#options_Custom_domain_name").val(options_Custom_domain_name);
          break;
        case 'imgdd':
          $("#exe_imgdd").addClass('active');
          $('#options_host').attr("disabled", true)
          break;
        default:
          if (window.navigator.userAgent.indexOf('Firefox') > -1) {
            $("#carouselExampleCaptions").prepend(`<button type="button" id="firefox-permission-toggle" class="css-button-rounded--sky"style="margin-bottom: 1em;">` + chrome.i18n.getMessage("Firefox_browser_access_permissions") + `</button>`)
            $("#carouselExampleCaptions").prepend(`
              <div class="alert alert-warning" role="alert">
              ` + chrome.i18n.getMessage("Firefox_browser_access_permissions_warning") + `
              </div>
              `)
            $("#firefox-permission-toggle").click(() => {
              browser.runtime.openOptionsPage();
            })
          }
          break;
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
        if ($('#CorsButton button').is(".css-button-rounded--red")) {
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
        if ($('#CorsButton button').is(".css-button-rounded--red")) {
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
        if ($('#CorsButton button').is(".css-button-rounded--red")) {
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
      if (prog.needUid == 13) {//Tg
        $('#options-form').append(prog.html_exeBox);
        $("#options_Custom_domain_name").val(options_Custom_domain_name);
      }
      if (prog.needUid == 14) {//imgdd
        $('#options-form').append(prog.html_exeBox);
        $('#options_host').val("imgdd.com")
        $('#options_host').attr("disabled", true)
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
                      toast_content: chrome.i18n.getMessage("Setting_successful_1"),
                      toast_DestroyTime: '15000'
                    })
                    $("#Object_Storage_cors button").attr("disabled", 'true')
                  }
                  if (err) {
                    console.error(err)
                    toastItem({
                      toast_content: chrome.i18n.getMessage("Setting_failed_1")
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
                          toast_content: chrome.i18n.getMessage("Setting_successful_2")
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
                      toast_content: chrome.i18n.getMessage("Setting_failed_1")
                    })
                  }
                });
              }
              set_cos_cors()
            } else {
              $("#Object_Storage_cors button").attr("disabled", 'true')
              toastItem({
                toast_content: chrome.i18n.getMessage("Setting_successful_3")
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
                    toast_content: chrome.i18n.getMessage("Setting_successful_4"),
                    toast_DestroyTime: '15000'
                  })
                  $("#Object_Storage_cors").attr("disabled", 'true')
                }).catch(error => {
                  console.error(error)
                  toastItem({
                    toast_content: chrome.i18n.getMessage("Setting_failed_1")
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
                      toast_content: chrome.i18n.getMessage("Setting_successful_2")
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
                toast_content: chrome.i18n.getMessage("Setting_successful_3")
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
                      toast_content: chrome.i18n.getMessage("Setting_successful_5"),
                      toast_DestroyTime: '15000'
                    })
                    $("#Object_Storage_cors button").attr("disabled", 'true')
                  }
                  if (err) {
                    console.error(err)
                    toastItem({
                      toast_content: chrome.i18n.getMessage("Setting_failed_1")
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
                        toast_content: chrome.i18n.getMessage("Setting_successful_2")
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
                toast_content: chrome.i18n.getMessage("Setting_successful_3")
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
                    toast_content: chrome.i18n.getMessage("Setting_failed_1")
                  })
                }
              }
              cos_getBucketAcl()
            } else {
              $('#putBucketACL button').attr("disabled", true)
              $('#putBucketACL ul').removeClass("show")
              toastItem({
                toast_content: chrome.i18n.getMessage("Setting_successful_3")
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
                    toast_content: chrome.i18n.getMessage("Setting_successful_1")
                  })
                }
              }
              oss_getBucketAcl()
            } else {
              $('#putBucketACL button').attr("disabled", true)
              $('#putBucketACL ul').removeClass("show")
              toastItem({
                toast_content: chrome.i18n.getMessage("Setting_successful_3")
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
        fetch(options_proxy_server + "https://" + options_host + "/api/v1/strategies", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': options_token
          }
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Network response was not ok.');
            }
          })
          .then(res => {
            let strategies = res.data.strategies;
            $("#options_source_select").empty();
            strategies.forEach(function (e, index) {
              $("#options_source_select").append(
                `<option value="` + e.id + `">` + e.name + `</option>`
              );
            });
            chrome.storage.local.get('options_source_select', function (data) {
              let selectedValue = data.options_source_select;
              let option = $('#options_source_select option[value=' + selectedValue + ']');
              if (option.length) {
                $('#options_source_select').val(selectedValue);
              } else {
                $('#options_source_select option:first').prop('selected', true);
                chrome.storage.local.set({ 'options_source_select': $("#options_source_select").val() });
              }
            });
          })
          .catch(error => {
            $("#options_source_select").append(
              `<option selected value="NO">` + chrome.i18n.getMessage("Unable_to_obtain_storage_source") + `</option>`
            );
            console.error(chrome.i18n.getMessage("request_failure"), error);
          });

      }
    }
    /**
     * 获取兰空图床相册列表
     */
    function Getalbums() {
      if (options_host) {//不为空时
        fetch(options_proxy_server + "https://" + options_host + "/api/v1/albums", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': options_token
          }
        })
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Network response was not ok.');
            }
          })
          .then(res => {
            let albums = res.data.data;
            $("#options_album_id").empty();
            $("#options_album_id").append(
              `<option selected value="">` + chrome.i18n.getMessage("default") + `</option>`
            );
            albums.forEach(function (e, index) {
              $("#options_album_id").append(
                `<option value="` + e.id + `">` + e.name + `</option>`
              );
            });

            chrome.storage.local.get('options_album_id', function (data) {
              let selectedValue = data.options_album_id;
              try {
                let option = $('#options_album_id option[value=' + selectedValue + ']');
                if (option) {
                  $('#options_album_id').val(selectedValue);
                }
              } catch (error) {
                $('#options_album_id option:first').prop('selected', true);
                chrome.storage.local.set({ 'options_album_id': $("#options_album_id").val() });
              }
            });
          })
          .catch(error => {
            $("#options_album_id").append(
              `<option selected value="NO">` + chrome.i18n.getMessage("Unable_to_obtain_album") + `</option>`
            );
            console.error(chrome.i18n.getMessage("request_failure"), error);
          });

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
            toast_content: chrome.i18n.getMessage("Video_upload_mode"),
          })

        } else {
          chrome.storage.local.set({ 'options_imgur_post_mode': "image" })
          // 关闭
          toastItem({
            toast_content: chrome.i18n.getMessage("Image_upload_mode"),
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
            toast_content: chrome.i18n.getMessage("CORS_proxy_cannot_be_empty")
          })
          setTimeout(function () {
            $("#options_save").removeClass('btn-danger');
          }, 2000);
          return;
        }
        if ($('#exe_Telegra_ph').hasClass('active')) {
          chrome.storage.local.set({ 'options_host': "telegra.ph" })
          chrome.storage.local.set({ 'options_Custom_domain_name': $("#options_Custom_domain_name").val() })
        } else {
          chrome.storage.local.set({ 'options_host': $("#options_host").val() })
        }
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
                toast_content: chrome.i18n.getMessage("Save_failed_1")
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
                toast_content: chrome.i18n.getMessage("Save_failed_1")
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
                toast_content: chrome.i18n.getMessage("Save_failed_1")
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
                toast_content: chrome.i18n.getMessage("Save_failed_1")
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
          toast_content: chrome.i18n.getMessage("Successfully_saved_1")
        })
        setTimeout(function () {
          window.location.reload();
        }, 1000); // 延迟 1.5 秒（1500 毫秒）

      } else {
        toastItem({
          toast_content: chrome.i18n.getMessage("select_upload_program")
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
      $("#CorsButton button").removeClass("css-button-rounded--black")
      $("#CorsButton button").addClass('css-button-rounded--red');
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
      $("#CorsButton button").removeClass("css-button-rounded--red")
      $("#CorsButton button").addClass('css-button-rounded--black');
      let $options_proxy_server = $('.options_proxy_server').parent()
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
          toast_content: chrome.i18n.getMessage("Unable_configure_CORS_proxy")
        })
        return;
      }
      if ($('#exe_Aliyun_OSS').hasClass('active')) {
        toastItem({
          toast_content: chrome.i18n.getMessage("Unable_configure_CORS_proxy")
        })
        return;
      }
      if ($('#exe_AWS_S3').hasClass('active')) {
        toastItem({
          toast_content: chrome.i18n.getMessage("Unable_configure_CORS_proxy")
        })
        return;
      }

      if ($('#CorsButton button').is(".css-button-rounded--red")) {
        Close_CORS_Element()
        toastItem({
          toast_content: chrome.i18n.getMessage("CORS_proxy_closed")
        })

      } else {
        Insert_CORS_Element()
        toastItem({
          toast_content: chrome.i18n.getMessage("CORS_proxy_opened")
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
            toast_content: chrome.i18n.getMessage("Enable_JSON_Conversion")
          })
        } else {
          chrome.storage.local.set({ 'open_json_button': 0 })
          toastItem({
            toast_content: chrome.i18n.getMessage("Disable_JSON_Conversion")
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
              <h1 class="modal-title fs-5" id="uploadArea_ModalLabel">`+ chrome.i18n.getMessage("Region_settings") + `</h1>&nbsp<span
                style="font-size: 10px; color: #333;">`+ chrome.i18n.getMessage("Region_settings_tips") + `</span>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
        
            <div class="modal-body" id="PNGmodal-body">
              <div id="edit_uploadArea"></div>
              <div style="width: 125px;"></div>
              <div style="width: 250px;">
                <div>
                  <label for="edit_uploadArea_width" class="form-label">`+ chrome.i18n.getMessage("width") + `:0px</label>
                  <input type="range" class="form-range" min="16" max="100" id="edit_uploadArea_width">
                </div>
                <div>
                  <label for="edit_uploadArea_height" class="form-label">`+ chrome.i18n.getMessage("height") + `:0%</label>
                  <input type="range" class="form-range" min="1" max="100" id="edit_uploadArea_height">
                </div>
                <div>
                  <label for="edit_uploadArea_Location" class="form-label">`+ chrome.i18n.getMessage("Location") + `:0</label>
                  <input type="range" class="form-range" min="1" max="100" id="edit_uploadArea_Location" disabled>
                </div>
                <div>
                  <label for="edit_uploadArea_opacity" class="form-label">`+ chrome.i18n.getMessage("opacity") + `:0</label>
                  <input type="range" class="form-range" min="5" max="100" id="edit_uploadArea_opacity">
                </div>
                <div>
                  <label for="edit_uploadArea_auto_close_time" class="form-label">`+ chrome.i18n.getMessage("auto_close_time") + `:2s</label>
                  <input type="range" class="form-range" min="2" max="100" id="edit_uploadArea_auto_close_time">
                </div>
                <div style="display: flex;">
                  <label for="edit_uploadArea_Left_or_Right" class="form-label" style="margin-right: .5rem;">`+ chrome.i18n.getMessage("edit_uploadArea_Left_or_Right") + `:</label>
                  <div style="display: flex;">
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="edit_uploadArea_Left_or_Right"
                        id="edit_uploadArea_Left">
                      <label class="form-check-label" for="edit_uploadArea_Left_or_Right" style="margin-right: 1rem;">
                      `+ chrome.i18n.getMessage("Left") + `
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="radio" name="edit_uploadArea_Left_or_Right"
                        id="edit_uploadArea_Right">
                      <label class="form-check-label" for="edit_uploadArea_Left_or_Right">
                      `+ chrome.i18n.getMessage("Right") + `
                      </label>
                    </div>
                  </div>
        
                </div>
        
        
              </div>
              <div style="width: 125px;"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="bi bi-x-lg"></i>`+ chrome.i18n.getMessage("close") + `</button>
              <button type="button" class="btn btn-danger" id="edit_uploadArea_reset" data-bs-dismiss="modal"><i
                  class="bi bi-arrow-repeat"></i>`+ chrome.i18n.getMessage("reset") + `</button>
              <button type="button" class="btn btn-primary" id="edit_uploadArea_save"><i
                  class="bi bi-check-lg"></i>`+ chrome.i18n.getMessage("save") + `</button>
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
          $("#edit_uploadArea_Location").prev('label').text(chrome.i18n.getMessage("Location") + ":" + edit_uploadArea_Location_value + "%");
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
      $("#edit_uploadArea_width").prev('label').text(chrome.i18n.getMessage("width") + ':' + edit_uploadArea_width + "px");
      // 高度

      edit_uploadArea.css('height', edit_uploadArea_height + '%');
      $("#edit_uploadArea_height").attr("value", edit_uploadArea_height)
      $("#edit_uploadArea_height").prev('label').text(chrome.i18n.getMessage("height") + ':' + edit_uploadArea_height + "%");
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
      $("#edit_uploadArea_Location").prev('label').text(chrome.i18n.getMessage("Location") + ':' + (edit_uploadArea_Location) + "%");

      //透明
      edit_uploadArea.css("background-color", `rgba(60,64,67,` + edit_uploadArea_opacity + `)`)
      $("#edit_uploadArea_opacity").attr("value", edit_uploadArea_opacity * 100)
      $("#edit_uploadArea_opacity").prev('label').text(chrome.i18n.getMessage("opacity") + ':' + edit_uploadArea_opacity);

      //自动关闭时间
      $("#edit_uploadArea_auto_close_time").attr("value", edit_uploadArea_auto_close_time)
      $("#edit_uploadArea_auto_close_time").prev('label').text(chrome.i18n.getMessage("auto_close_time") + ':' + edit_uploadArea_auto_close_time + "s");
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
        $(this).prev('label').text(chrome.i18n.getMessage("width") + ':' + edit_uploadArea_width_value + "px");
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
        $(this).prev('label').text(chrome.i18n.getMessage("height") + ':' + edit_uploadArea_height_value + "%");
        $("#edit_uploadArea_Location").prev('label').text(chrome.i18n.getMessage("Location") + ':' + edit_uploadArea_Location_value + "%");
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
        $("#edit_uploadArea_opacity").prev('label').text(chrome.i18n.getMessage("opacity") + ':' + edit_uploadArea_opacity_value);
        edit_uploadArea.css("background-color", `rgba(60,64,67,` + edit_uploadArea_opacity_value + `)`)
        edit_uploadArea_opacity = edit_uploadArea_opacity_value
      });

      $('#edit_uploadArea_auto_close_time').on('input', function () {
        edit_uploadArea_auto_close_time_value = $(this).val();
        $("#edit_uploadArea_auto_close_time").prev('label').text(chrome.i18n.getMessage("auto_close_time") + ':' + edit_uploadArea_auto_close_time_value + "s");
        edit_uploadArea_auto_close_time = edit_uploadArea_auto_close_time_value
      });


      $("#edit_uploadArea_save").click(function () {
        chrome.storage.local.set({ "edit_uploadArea_width": edit_uploadArea_width_value })
        chrome.storage.local.set({ "edit_uploadArea_height": edit_uploadArea_height_value })
        chrome.storage.local.set({ "edit_uploadArea_Location": edit_uploadArea_Location_value })
        chrome.storage.local.set({ "edit_uploadArea_opacity": edit_uploadArea_opacity_value })
        chrome.storage.local.set({ "edit_uploadArea_auto_close_time": edit_uploadArea_auto_close_time_value })
        toastItem({
          toast_content: chrome.i18n.getMessage("Successfully_saved_2")
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
          toast_content: chrome.i18n.getMessage("Successfully_Reset_1")
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
  let options_webtitle = localStorage.options_webtitle
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
    try {
      chrome.runtime.reload();
    } catch (error) {
      toastItem({
        toast_content: chrome.i18n.getMessage("Setting_successful_6")
      })
    }
  });
  $('#options_Open_with_Window').click(function () {
    chrome.storage.local.set({ 'browser_Open_with': 2 }, function () {
      // 打开方式为：在新窗口打开
    });
    try {
      chrome.runtime.reload();
    } catch (error) {
      toastItem({
        toast_content: chrome.i18n.getMessage("Setting_successful_6")
      })
    }
  });
  $('#options_Open_with_Inside').click(function () {
    if (window.navigator.userAgent.indexOf('Firefox') > -1) {
      toastItem({
        toast_content: chrome.i18n.getMessage("Setting_failed_2")
      })
      return;
    } else {
      alert(chrome.i18n.getMessage("Setting_successful_7"))
      chrome.storage.local.set({ 'browser_Open_with': 3 }, function () {
        // 打开方式为：在内置页打开
      });
      chrome.runtime.reload();
    }
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
          toast_content: chrome.i18n.getMessage("Successfully_opened_1")
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

  chrome.storage.local.get(["AutoCopy"], function (result) {
    if ($('a[value="' + result.AutoCopy + '"]').length) {
      $('a[value="' + result.AutoCopy + '"]').addClass("active")
    } else {
      chrome.storage.local.set({ "AutoCopy": "AutoCopy_off" })
      $('a[value="AutoCopy_off"]').addClass("active")
    }
    if (result.AutoCopy == "AutoCopy_on") {
      $("#AutoCopy button").addClass("btn-primary")
    } else if (result.AutoCopy == "AutoCopy_off") {
      $("#AutoCopy button").addClass("btn-dark")
    }


    $('#AutoCopy .dropdown-item').click(function () {
      let val = $(this).attr("value")
      $("#AutoCopy button").removeClass("btn-primary btn-dark")
      if (val == "AutoCopy_on") {
        toastItem({
          toast_content: chrome.i18n.getMessage("Successfully_opened_1")
        });
        $("#AutoCopy button").addClass("btn-primary")
      } else if (val == "AutoCopy_off") {
        $("#AutoCopy button").addClass("btn-dark")
      }

      chrome.storage.local.set({ "AutoCopy": val })
      $('#AutoCopy .dropdown-item').removeClass("active")
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
  $("#VERSION").text(chrome.i18n.getMessage("VERSION_1") + ":V" + chrome.runtime.getManifest().version)
  $("#VERSION").click(function () {
    $("#VERSION").text(chrome.i18n.getMessage("Obtaining"))
    fetch(`https://api.github.com/repos/ZenEcho/PLExtension/releases/latest`)
      .then(response => response.json())
      .then(data => {
        let localVersion = chrome.runtime.getManifest().version; //本地
        let remoteVersion = data.name; //远程
        if (remoteVersion) {
          let result = compareVersions(localVersion, remoteVersion);
          if (result === -1) {
            $("#VERSION").text(chrome.i18n.getMessage("VERSION_2") + ":V" + remoteVersion)
            $("#VERSION").css({ "color": "red" })
            if (confirm(chrome.i18n.getMessage("VERSION_3"))) {
              window.open("https://github.com/ZenEcho/PLExtension/releases")
            }
            // 远程版本较新
          } else {
            $("#VERSION").text(chrome.i18n.getMessage("VERSION_4") + ":V" + localVersion)
          }
        } else {
          toastItem({
            toast_content: data.message
          });
          $("#VERSION").text(chrome.i18n.getMessage("VERSION_5"))
        }

      })
      .catch(error => {
        $("#VERSION").text(chrome.i18n.getMessage("VERSION_5"))
        console.error(chrome.i18n.getMessage("Request_error"), error);
      });
  })
  function compareVersions(localVersion, remoteVersion) {
    // 将本地版本号和远程版本号拆分为部分
    let localParts = localVersion.split('.');
    let remoteParts = remoteVersion.split('.');
    // 比较每个部分的数值
    for (let i = 0; i < Math.max(localParts.length, remoteParts.length); i++) {
      let localNum = parseInt(localParts[i] || 0); // 如果部分不存在，则假设为0
      let remoteNum = parseInt(remoteParts[i] || 0); // 如果部分不存在，则假设为0
      if (localNum < remoteNum) {
        return -1; // 本地版本号较小
      } else if (localNum > remoteNum) {
        return 1; // 本地版本号较大
      }
    }
    return 0; // 版本号相等
  }

  animation_button2('.Animation_button2').then(function () {
    overlayElement.remove()
  });
});

