const overlayElement = $(`.overlay`);
$("#Sidebar_area").attr("disabled", true)
$(document).ready(function () {
  chrome.storage.local.get(storagelocal, function (result) {
    if (result.ProgramConfiguration) {
      const programConfig = result.ProgramConfiguration || {};
      for (const key in ProgramConfigurations) {
        if (programConfig.hasOwnProperty(key)) {
          ProgramConfigurations[key] = programConfig[key];
        }
      }
    }
    uploadArea = result.uploadArea || {};


    // 初始化新安装时的判断跨域开关
    if (ProgramConfigurations.options_proxy_server_state == 0) {
      ProgramConfigurations.options_proxy_server = ""
    }
    if (!ProgramConfigurations.options_proxy_server) {
      ProgramConfigurations.options_proxy_server = ""
    }

    // 初始化新安装时的imgur模式
    if (!ProgramConfigurations.options_imgur_post_mode) {
      ProgramConfigurations.options_imgur_post_mode = 0
      addToQueue(() => storProgramConfiguration({ options_imgur_post_mode: 0 }));

    }
    // 初始化新安装时的JSON转换模式
    if (!ProgramConfigurations.open_json_button) {
      ProgramConfigurations.open_json_button = 0
      addToQueue(() => storProgramConfiguration({ open_json_button: 0 }));
    }
    if (!ProgramConfigurations.custom_Base64Upload) {
      ProgramConfigurations.custom_Base64Upload = 0
      addToQueue(() => storProgramConfiguration({ custom_Base64Upload: 0 }));
    }

    function createCustomFormGroup(options) {
      const {
        label: { class: labelClass = "", text: labelValue = "" } = {},
        input: {
          type: inputType = "text",
          class: inputClass = "",
          id: inputId = "",
          inputAttr: attributes = "",
          inputPlaceholder: placeholderKey = "",
          required = false,
        } = {},
        select: {
          id: selectId = '',
          class: selectClass = "",
          optionTag: {
            value: selectOptionValue = "",
            text: selectOptionText = "",
            optionSelected = false
          } = {}
        } = {},
        textarea: {
          id: textareaId = "",
          class: textareaClass = "",
          labelText: textareaLabelText = ""
        } = {},
        additionalElement = [],
      } = options;

      // 构建 label 元素
      let labelElement = `<label for="${inputId || selectId || textareaId}" class="${labelClass}">${labelValue}</label>`;

      // 构建 input 元素
      let inputElement = `<input type="${inputType}" class="form-control box-shadow ${inputClass}" id="${inputId}" placeholder="${placeholderKey}"`;
      // 添加 required 属性
      if (required) {
        inputElement += " required";
      }
      // 添加其他自定义属性
      if (attributes) {
        inputElement += " " + attributes;
      }
      inputElement += " />";

      // 构建 select 元素
      let selectElement = `<select id="${selectId}" class="form-select box-shadow ${selectClass}">`;
      if (options.select && options.select.optionTag) {
        options.select.optionTag.forEach((option) => {
          let optionTag = `<option value="${option.value}"`
          if (option.Selected == true) {
            optionTag += ` Selected`
          }
          optionTag += `>${option.text}</option>`
          selectElement += optionTag;
        });
      }
      selectElement += `</select>`;

      let textareaElement = `
      <div class="form-floating">
        <textarea  class="form-control box-shadow ${textareaClass}" id="${textareaId}"></textarea>
        <label for="floatingTextarea">${textareaLabelText}</label>
      </div>
      `

      const additionalHtml = additionalElement ? additionalElement.join("") : "";
      if (!options.label && additionalElement.length) {
        return `${additionalHtml}`;
      }
      if (options.label) {
        if (options.input) {
          return `
          <div class="form-group">
            ${labelElement}
            ${inputElement}
          </div>
          ${additionalHtml}
        `;
        } else if (options.select) {
          return `
          <div class="form-group">
            ${labelElement}
            ${selectElement}
          </div>
          ${additionalHtml}
        `;
        } else if (options.textarea) {
          return `
          <div class="form-group">
            ${labelElement}
            ${textareaElement}
          </div>
          ${additionalHtml}
        `;
        } else {
          return `
          <div class="form-group">
            input或者select或者textarea未填写
          </div>
        `;
        }

      }
    }

    // 创建一个函数来生成表单组元素
    function createFormGroups(formGroupsData) {
      let formGroupsHtml = "";

      formGroupsData.forEach((data) => {
        const formGroupHtml = createCustomFormGroup(data);
        formGroupsHtml += formGroupHtml;
      });

      return formGroupsHtml;
    }
    const lskyCustomFormGroup = [
      {
        label: { text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_lsky"), required: true,
        }
      },
      {
        label: { text: chrome.i18n.getMessage("options_token") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_lsky"), required: true,
        }
      },
      {
        label: { class: "options_album_id", text: chrome.i18n.getMessage("options_album_id") },
        select: {
          id: "options_album_id",
        },
      },
      {
        label: { class: "options_permission", text: chrome.i18n.getMessage("options_permission") },
        select: {
          id: "options_permission_select",
          optionTag: [
            { value: "0", text: chrome.i18n.getMessage("options_permission_0"), Selected: true },
            { value: "1", text: chrome.i18n.getMessage("options_permission_1") },
          ],
        },
      },
      {
        label: { class: "options_source", text: chrome.i18n.getMessage("options_source_lsky") },
        select: {
          id: "options_source_select",
        },
      },

    ];
    const EasyImagesCustomFormGroup = [
      {
        label: { class: "options_host", text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_EasyImages"), required: true,
        }
      },
      {
        label: { class: "options_token", text: chrome.i18n.getMessage("options_token") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_EasyImages"), required: true,
        }
      },

    ];
    const ImgURLCustomFormGroup = [
      {
        label: { class: "options_host", text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_ImgURL"), required: true,
        }
      },
      {
        label: { class: "options_token", text: chrome.i18n.getMessage("options_token") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_ImgURL"), required: true,
        }
      },
      {
        label: { class: "options_uid", text: chrome.i18n.getMessage("options_uid") },
        input: {
          type: "text", id: "options_uid", inputPlaceholder: chrome.i18n.getMessage("options_uid_placeholder"), required: true,
        }
      },

    ];
    const SM_MSCustomFormGroup = [
      {
        label: { class: "options_host", text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_SM_MS"), required: true,
        }
      },
      {
        label: { class: "options_token", text: chrome.i18n.getMessage("options_token") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_SM_MS"), required: true,
        }
      },
    ];
    const CheveretoCustomFormGroup = [
      {
        label: { class: "options_host", text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_Chevereto"), required: true,
        }
      },
      {
        label: { class: "options_token", text: chrome.i18n.getMessage("options_token") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_Chevereto"), required: true,
        }
      },
      {
        label: { class: "options_album_id", text: chrome.i18n.getMessage("options_album_id_Chevereto") },
        input: {
          type: "text", id: "options_album_id", inputPlaceholder: chrome.i18n.getMessage("options_album_id_placeholder_Chevereto"),
        }
      },
      {
        label: { class: "options_nsfw", text: chrome.i18n.getMessage("options_nsfw") },
        select: {
          id: "options_nsfw_select",
          optionTag: [
            { value: "0", text: chrome.i18n.getMessage("options_nsfw_0"), Selected: true },
            { value: "1", text: chrome.i18n.getMessage("options_nsfw_1") },
          ],
        },
      },
      {
        label: { class: "options_expiration", text: chrome.i18n.getMessage("options_expiration") },
        select: {
          id: "options_expiration_select",
          optionTag: [
            { value: "NODEL", text: chrome.i18n.getMessage("options_expiration_no"), Selected: true },
            { value: "PT5M", text: chrome.i18n.getMessage("options_expiration_1") },
            { value: "PT15M", text: chrome.i18n.getMessage("options_expiration_2") },
            { value: "PT30M", text: chrome.i18n.getMessage("options_expiration_3") },
            { value: "PT1H", text: chrome.i18n.getMessage("options_expiration_4") },
            { value: "PT3H", text: chrome.i18n.getMessage("options_expiration_5") },
            { value: "PT6H", text: chrome.i18n.getMessage("options_expiration_6") },
            { value: "PT12H", text: chrome.i18n.getMessage("options_expiration_7") },
            { value: "P1D", text: chrome.i18n.getMessage("options_expiration_8") },
            { value: "P2D", text: chrome.i18n.getMessage("options_expiration_9") },
            { value: "P3D", text: chrome.i18n.getMessage("options_expiration_10") },
            { value: "P4D", text: chrome.i18n.getMessage("options_expiration_11") },
            { value: "P5D", text: chrome.i18n.getMessage("options_expiration_12") },
            { value: "P6D", text: chrome.i18n.getMessage("options_expiration_13") },
            { value: "P1W", text: chrome.i18n.getMessage("options_expiration_14") },
            { value: "P2W", text: chrome.i18n.getMessage("options_expiration_15") },
            { value: "P3W", text: chrome.i18n.getMessage("options_expiration_16") },
            { value: "P1M", text: chrome.i18n.getMessage("options_expiration_17") },
            { value: "P2M", text: chrome.i18n.getMessage("options_expiration_18") },
            { value: "P3M", text: chrome.i18n.getMessage("options_expiration_19") },
            { value: "P4M", text: chrome.i18n.getMessage("options_expiration_20") },
            { value: "P5M", text: chrome.i18n.getMessage("options_expiration_21") },
            { value: "P6M", text: chrome.i18n.getMessage("options_expiration_22") },
            { value: "P1Y", text: chrome.i18n.getMessage("options_expiration_23") },

          ],
        },
      },
    ];
    const HellohaoCustomFormGroup = [
      {
        label: { class: "options_host", text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_Hellohao"), required: true,
        }
      },
      {
        label: { class: "options_token", text: chrome.i18n.getMessage("options_token") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_Hellohao"), required: true,
        }
      },
      {
        label: { class: "options_source", text: chrome.i18n.getMessage("options_source_Hellohao") },
        input: {
          type: "text", id: "options_source", inputPlaceholder: chrome.i18n.getMessage("options_source_placeholder_Hellohao"), required: true,
        }
      },
    ];
    const ImgurCustomFormGroup = [
      {
        label: { class: "options_host", text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_Imgur"), required: true,
        }
      },
      {
        label: { class: "options_token", text: chrome.i18n.getMessage("options_token") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_Imgur"), required: true,
        }
      },
      {
        additionalElement: [
          `<div class="ImgurPostModeDiv " style="text-align: center;">Image
          <label class="switch">
            <input id="options_imgur_post_mode" type="checkbox">
            <div class="slider round"></div>
          </label>video
          </div>`
        ],
      },
    ];
    const UserCustomFormGroup = [
      {
        label: { class: "options_apihost", text: chrome.i18n.getMessage("options_apihost") },
        input: {
          type: "url", id: "options_apihost", inputPlaceholder: chrome.i18n.getMessage("options_apihost_placeholder"), required: true,
        },
        additionalElement: [
          `
          <div>
          <label for="requestMethod" style=" font-size: 18px; font-weight: bold; margin-bottom: 20px;"><span class="required-marker"> *</span>`+ chrome.i18n.getMessage("Request_method") + `：</label>
          <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="requestMethod" id="requestMethod_POST" value="POST" checked>
              <label class="form-check-label" for="requestMethod_POST">POST</label>
          </div>
          <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" name="requestMethod" id="requestMethod_PUT" value="PUT">
              <label class="form-check-label" for="requestMethod_PUT">PUT</label>
          </div>
      </div>
          `
        ],
      },
      {
        label: { class: "options_parameter", text: chrome.i18n.getMessage("options_parameter") },
        input: {
          type: "text", id: "options_parameter", inputPlaceholder: chrome.i18n.getMessage("options_parameter_placeholder"), required: true,
        }
      },
      {
        label: { class: "options_Headers", text: chrome.i18n.getMessage("options_Headers") },
        textarea: {
          id: "options_Headers", labelText: chrome.i18n.getMessage("options_Headers_floatingTextarea")
        }
      },
      {
        label: { class: "options_Body", text: chrome.i18n.getMessage("options_Body") },
        textarea: {
          id: "options_Body", labelText: chrome.i18n.getMessage("options_Body_floatingTextarea")
        }
      },
      {
        label: { class: "options_return_success", text: chrome.i18n.getMessage("options_return_success") },
        input: {
          type: "text", id: "options_return_success", inputPlaceholder: chrome.i18n.getMessage("options_return_success_placeholder"), required: true,
        },
      },
      {
        additionalElement: [
          `<div class="form-group" style=" display: flex; ">
            <div style=" width: 100%; ">
              <label for="custom_ReturnPrefix">`+ chrome.i18n.getMessage("custom_ReturnPrefix") + `</label>
              <input type="text" class="form-control box-shadow " id="custom_ReturnPrefix" placeholder="如:https://www.google.com/">
            </div>
            <div style=" width: 100%; ">
              <label for="custom_ReturnAppend" >`+ chrome.i18n.getMessage("custom_ReturnAppend") + `</label>
              <input type="text" class="form-control box-shadow " id="custom_ReturnAppend" placeholder="如:.png">
            </div>
          </div>`
        ],
      },
      {
        additionalElement: [
          `<div class="form-group" style=" display: flex;">
            <div style=" width: 100%; ">
              <label for="Keyword_replacement1">关键词<p>(开启“关键词替换”后生效)</p></label>
              <input type="text" class="form-control box-shadow " id="Keyword_replacement1" placeholder="多个关键词使用,分割">
            </div>
            <div style=" width: 100%; ">
              <label for="Keyword_replacement2">替换为<p>(否则输入无效)</p></label>
              <input type="text" class="form-control box-shadow " id="Keyword_replacement2" placeholder="必须与关键词数量一致">
            </div>
          </div>`
        ],
      },
      {
        additionalElement: [
          `
          <div class="accordion" id="accordionPanelsStayOpenExample">
          <div class="accordion-item">
              <h2 class="accordion-header" id="panelsStayOpen-headingOne">
                  <button class="accordion-button" type="button" data-bs-toggle="collapse"
                      data-bs-target="#panelsStayOpen-collapseOne" aria-expanded="true"
                      aria-controls="panelsStayOpen-collapseOne">
                      上传前设置
                  </button>
              </h2>
              <div id="panelsStayOpen-collapseOne" class="accordion-collapse collapse show"
                  aria-labelledby="panelsStayOpen-headingOne">
                  <div class="accordion-body">
                      <div class="form-group">
                          <div class="form-check form-switch" style="margin-top: 1rem;">
                              <input class="form-check-input" type="checkbox" role="switch" id="custom_Base64Upload">
                              <label class="form-check-label" for="flexSwitchCheckDefault">`+ chrome.i18n.getMessage("custom_Base64Upload") + `
                                  </label>
                          </div>
                      </div>
                      <div class="form-group">
                          <div class="form-check form-switch" style="margin-top: 1rem;">
                              <input class="form-check-input" type="checkbox" role="switch"
                                  id="custom_Base64UploadRemovePrefix">
                              <label class="form-check-label" for="flexSwitchCheckDefault">`+ chrome.i18n.getMessage("custom_Base64UploadRemovePrefix") + `
                                  </label>
                          </div>
                      </div>
                      <div class="form-group">
                          <div class="form-check form-switch" style="margin-top: 1rem;">
                              <input class="form-check-input" type="checkbox" role="switch" id="custom_BodyUpload">
                              <label class="form-check-label" for="flexSwitchCheckDefault">`+ chrome.i18n.getMessage("custom_BodyUpload") + `
                                  </label>
                          </div>
                      </div>
                      <div class="form-group">
                          <div class="form-check form-switch" style="margin-top: 1rem;">
                              <input class="form-check-input" type="checkbox" role="switch" id="custom_BodyStringify">
                              <label class="form-check-label" for="flexSwitchCheckDefault">`+ chrome.i18n.getMessage("custom_BodyStringify") + `
                                  </label>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="accordion-item">
              <h2 class="accordion-header" id="panelsStayOpen-headingTwo">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                      data-bs-target="#panelsStayOpen-collapseTwo" aria-expanded="false"
                      aria-controls="panelsStayOpen-collapseTwo">
                      上传成功后
                  </button>
              </h2>
              <div id="panelsStayOpen-collapseTwo" class="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingTwo">
                  <div class="accordion-body">
                      <div class="form-group">
                          <div class="form-check form-switch" style="margin-top: 1rem;">
                              <input class="form-check-input" type="checkbox" role="switch" id="open_json_button">
                              <label class="form-check-label" for="flexSwitchCheckDefault">` +
          chrome.i18n.getMessage("open_json_button") + `</label>
                          </div>
                      </div>
                      <div class="form-group">
                          <div class="form-check form-switch" style="margin-top: 1rem;">
                              <input class="form-check-input" type="checkbox" role="switch" id="custom_KeywordReplacement">
                              <label class="form-check-label" for="flexSwitchCheckDefault">关键词替换<p>(替换返回信息里的某一段内容)</p></label>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          <div class="accordion-item">
              <h2 class="accordion-header" id="panelsStayOpen-headingThree">
                  <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                      data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="false"
                      aria-controls="panelsStayOpen-collapseThree">
                      上传变量
                  </button>
              </h2>
              <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse"
                  aria-labelledby="panelsStayOpen-headingThree">
                  <div class="accordion-body">
                  <ol class="list-group list-group-numbered">
  <li class="list-group-item d-flex justify-content-between align-items-start">
    <div class="ms-2 me-auto">
      <div class="fw-bold">$date$</div>
      表示日期:2023年10月13日
    </div>
    <div class="ms-2 me-auto">
      <div class="fw-bold">$date-yyyy$</div>
      表示年:2023
    </div>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-start">
    <div class="ms-2 me-auto">
      <div class="fw-bold">$date-mm$</div>
      表示月:10
    </div>
    <div class="ms-2 me-auto">
      <div class="fw-bold">$date-dd$</div>
      表示日:13
    </div>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-start">
    <div class="ms-2 me-auto">
      <div class="fw-bold">$date-time$</div>
      毫秒时间戳:1697183031000
    </div>
    <div class="ms-2 me-auto">
      <div class="fw-bold">$date-Time$</div>
      秒钟时间戳:1697183256
    </div>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-start">
    <div class="ms-2 me-auto">
      <div class="fw-bold">$file$</div>
      表示上传的文件,开启了Base64后表示Base64
    </div>
    <div class="ms-2 me-auto">
      <div class="fw-bold">$fileName$</div>
      表示文件名:1.png
    </div>
  </li>
  <li class="list-group-item d-flex justify-content-between align-items-start">
    <div class="ms-2 me-auto">
      <div class="fw-bold">$fileSize$</div>
      表示文件的大小
    </div>
    <div class="ms-2 me-auto">
      <div class="fw-bold">$fileType$</div>
      表示文件的类型
    </div>
  </li>
</ol>
                  </div>
              </div>
          </div>
      </div>
          `
        ],
      },
    ];
    const GitHubUPCustomFormGroup = [
      {
        label: { class: "options_owner", text: chrome.i18n.getMessage("options_owner") },
        input: {
          type: "text", id: "options_owner", inputPlaceholder: chrome.i18n.getMessage("options_owner_placeholder"), required: true,
        }
      },
      {
        label: { class: "options_repository", text: chrome.i18n.getMessage("options_repository") },
        input: {
          type: "text", id: "options_repository", inputPlaceholder: chrome.i18n.getMessage("options_repository_placeholder"), required: true,
        }
      },
      {
        label: { class: "options_UploadPath", text: chrome.i18n.getMessage("options_UploadPath") },
        input: {
          type: "text", id: "options_UploadPath", inputPlaceholder: chrome.i18n.getMessage("options_UploadPath_placeholder"),
        }
      },
      {
        label: { class: "options_token", text: chrome.i18n.getMessage("options_token_GitHub") },
        input: {
          type: "text", id: "options_token", inputPlaceholder: chrome.i18n.getMessage("options_token_placeholder_GitHub"), required: true,
        },
        additionalElement: [
          `<div class="alert alert-warning" role="alert">
          ${chrome.i18n.getMessage("options_GitHub_Warning")}
          </div>`
        ]
      },
    ];
    const Tencent_COSCustomFormGroup = [
      {
        label: { class: "options_SecretId", text: chrome.i18n.getMessage("options_SecretId_COS") },
        input: {
          type: "text", id: "options_SecretId", inputPlaceholder: chrome.i18n.getMessage("options_SecretId_placeholder_COS"), required: true,
        }
      },
      {
        label: { class: "options_SecretKey", text: chrome.i18n.getMessage("options_SecretKey_COS") },
        input: {
          type: "password", id: "options_SecretKey", inputPlaceholder: chrome.i18n.getMessage("options_SecretKey_placeholder_COS"), required: true,
        }
      },
      {
        label: { class: "options_Bucket", text: chrome.i18n.getMessage("options_Bucket_COS") },
        input: {
          type: "text", id: "options_Bucket", inputPlaceholder: chrome.i18n.getMessage("options_Bucket_placeholder_COS"), required: true,
        }
      },
      {
        label: { class: "options_AppId", text: chrome.i18n.getMessage("options_AppId_COS") },
        input: {
          type: "text", id: "options_AppId", inputPlaceholder: chrome.i18n.getMessage("options_AppId_placeholder_COS"),
        }
      },
      {
        label: { class: "options_Region", text: chrome.i18n.getMessage("options_Region_COS") },
        input: {
          type: "text", id: "options_Region", inputPlaceholder: chrome.i18n.getMessage("options_Region_placeholder_COS"), required: true,
        }
      },
      {
        label: { class: "options_UploadPath", text: chrome.i18n.getMessage("options_UploadPath") },
        input: {
          type: "text", id: "options_UploadPath", inputPlaceholder: chrome.i18n.getMessage("options_UploadPath_placeholder"),
        }
      },
      {
        label: { class: "options_Custom_domain_name", text: chrome.i18n.getMessage("options_Custom_domain_name_COS") },
        input: {
          type: "url", id: "options_Custom_domain_name", inputPlaceholder: chrome.i18n.getMessage("options_Custom_domain_name_placeholder"),
        }
      },

    ];
    const Aliyun_OSSCustomFormGroup = [
      {
        label: { class: "options_SecretId", text: chrome.i18n.getMessage("options_SecretId_OSS") },
        input: {
          type: "text", id: "options_SecretId", inputPlaceholder: chrome.i18n.getMessage("options_SecretId_placeholder_OSS"), required: true,
        }
      },
      {
        label: { class: "options_SecretKey", text: chrome.i18n.getMessage("options_SecretKey_OSS") },
        input: {
          type: "password", id: "options_SecretKey", inputPlaceholder: chrome.i18n.getMessage("options_SecretKey_placeholder_OSS"), required: true,
        }
      },
      {
        label: { class: "options_Bucket", text: chrome.i18n.getMessage("options_Bucket_OSS") },
        input: {
          type: "text", id: "options_Bucket", inputPlaceholder: chrome.i18n.getMessage("options_Bucket_placeholder_OSS"), required: true,
        }
      },
      {
        label: { class: "options_Endpoint", text: chrome.i18n.getMessage("options_Endpoint_OSS") },
        input: {
          type: "text", id: "options_Endpoint", inputPlaceholder: chrome.i18n.getMessage("options_Endpoint_placeholder_OSS"), required: true,
        }
      },
      {
        label: { class: "options_Region", text: chrome.i18n.getMessage("options_Region_OSS") },
        input: {
          type: "text", id: "options_Region", inputPlaceholder: chrome.i18n.getMessage("options_Region_placeholder_OSS"), required: true,
        }
      },
      {
        label: { class: "options_UploadPath", text: chrome.i18n.getMessage("options_UploadPath") },
        input: {
          type: "text", id: "options_UploadPath", inputPlaceholder: chrome.i18n.getMessage("options_UploadPath_placeholder"),
        }
      },
      {
        label: { class: "options_Custom_domain_name", text: chrome.i18n.getMessage("options_Custom_domain_name_COS") },
        input: {
          type: "url", id: "options_Custom_domain_name", inputPlaceholder: chrome.i18n.getMessage("options_Custom_domain_name_placeholder"),
        }
      },

    ];
    const AWS_S3CustomFormGroup = [
      {
        label: { class: "options_SecretId", text: chrome.i18n.getMessage("options_SecretId_S3") },
        input: {
          type: "text", id: "options_SecretId", inputPlaceholder: chrome.i18n.getMessage("options_SecretId_placeholder_S3"), required: true,
        }
      },
      {
        label: { class: "options_SecretKey", text: chrome.i18n.getMessage("options_SecretKey_S3") },
        input: {
          type: "password", id: "options_SecretKey", inputPlaceholder: chrome.i18n.getMessage("options_SecretKey_placeholder_S3"), required: true,
        }
      },
      {
        label: { class: "options_Bucket", text: chrome.i18n.getMessage("options_Bucket_S3") },
        input: {
          type: "text", id: "options_Bucket", inputPlaceholder: chrome.i18n.getMessage("options_Bucket_placeholder_S3"), required: true,
        }
      },
      {
        label: { class: "options_Region", text: chrome.i18n.getMessage("options_Region_S3") },
        input: {
          type: "text", id: "options_Region", inputPlaceholder: chrome.i18n.getMessage("options_Region_placeholder_S3"), required: true,
        }
      },
      {
        label: { class: "options_Endpoint", text: chrome.i18n.getMessage("options_Endpoint_S3") },
        input: {
          type: "text", id: "options_Endpoint", inputPlaceholder: chrome.i18n.getMessage("options_Endpoint_placeholder_S3"),
        }
      },
      {
        label: { class: "options_UploadPath", text: chrome.i18n.getMessage("options_UploadPath") },
        input: {
          type: "text", id: "options_UploadPath", inputPlaceholder: chrome.i18n.getMessage("options_UploadPath_placeholder"),
        }
      },
      {
        label: { class: "options_Custom_domain_name", text: chrome.i18n.getMessage("options_Custom_domain_name_S3") },
        input: {
          type: "url", id: "options_Custom_domain_name", inputPlaceholder: chrome.i18n.getMessage("options_Custom_domain_name_placeholder"),
        }
      },

    ];
    const Telegra_phCustomFormGroup = [
      {
        additionalElement: [
          `<div class="alert alert-success" role="alert">
            <h4 class="alert-heading">` + chrome.i18n.getMessage("Telegra_ph_1") + `</h4>
            <p>` + chrome.i18n.getMessage("Telegra_ph_2") + `</p>
            <hr>
            <p class="mb-0">` + chrome.i18n.getMessage("Telegra_ph_3") + `</p>
          </div>`
        ]
      },
      {
        label: { class: "options_Custom_domain_name", text: chrome.i18n.getMessage("options_Custom_domain_name_Telegra_ph") },
        input: {
          type: "url", id: "options_Custom_domain_name", inputPlaceholder: chrome.i18n.getMessage("options_Custom_domain_name_placeholder_Telegra_ph"),
        }
      },

    ];
    const imgddCustomFormGroup = [
      {
        label: { text: chrome.i18n.getMessage("options_host") },
        input: {
          type: "text", id: "options_host", inputPlaceholder: chrome.i18n.getMessage("options_host_placeholder_lsky"), required: true,
        }
      },
    ];
    const fiftyEightCustomFormGroup = [
      {
        additionalElement: [
          ` <div class="alert alert-success" role="alert">
            <h4 class="alert-heading">58同城接口</h4>
            <p>无需配置,保存即可使用</p>
            <hr>
            <p class="mb-0">` + chrome.i18n.getMessage("Telegra_ph_3") + `</p>
          </div>`
        ]
      },
    ];
    const BilibliBedCustomFormGroup = [
      {
        additionalElement: [
          `<div class="alert alert-danger" role="alert">哔哩哔哩上传完全依赖后端上传,请部署后端服务!</div>`
        ]
      },
      {
        label: { class: "options_apihost", text: "后端请求地址<p>(为空时使用默认后端)" },
        input: {
          type: "url", id: "options_apihost", inputPlaceholder: "无法携带cookie，填写完整url",
        }
      },
      {
        label: { class: "options_token", text: "SESSDATA<p>(为空时:登录哔哩哔哩自动获取)</p>" },
        input: {
          type: "text", id: "options_token", inputPlaceholder: "SESSDATA值",
        }
      },
      {
        label: { class: "options_CSRF", text: "CSRF<p>(为空时:登录哔哩哔哩自动获取)</p>" },
        input: {
          type: "text", id: "options_CSRF", inputPlaceholder: "CSRF值",
        }
      },
      {
        additionalElement: [
          `<div class="alert alert-warning" role="alert">如果你不希望程序自动获取cookie,请随便填写内容或填写准备好的SESSDATA,CSRF。</div>`
        ]
      },
    ];
    const BaiJiaHaoBedCustomFormGroup = [
      {
        additionalElement: [
          `<div class="alert alert-warning" role="alert">
            <h4 class="alert-heading">百家号接口</h4>
            <p>使用,请保持百度登录</p>
            <hr>
            <p class="mb-0">` + chrome.i18n.getMessage("Telegra_ph_3") + `</p>
          </div>`
        ]
      },
    ];
    const freebufBedCustomFormGroup = [
      {
        additionalElement: [
          `<div class="alert alert-success" role="alert">
            <h4 class="alert-heading">freebuf接口</h4>
            <p>无需配置,保存即可使用</p>
            <hr>
            <p class="mb-0">`+ chrome.i18n.getMessage("Telegra_ph_3") + `</p>
          </div>`
        ]
      },
    ];
    const toutiaoBedCustomFormGroup = [
      {
        additionalElement: [
          `<div class="alert alert-success" role="alert">
            <h4 class="alert-heading">今日头条接口</h4>
            <p>无需配置,保存即可使用</p>
            <hr>
            <p class="mb-0">`+ chrome.i18n.getMessage("Telegra_ph_3") + `</p>
          </div>`
        ]
      },
    ];
    const toutiaoBed2CustomFormGroup = [
      {
        additionalElement: [
          `<div class="alert alert-danger" role="alert">今日头条2接口上传完全依赖后端上传,请部署后端服务!</div>`
        ]
      },
      {
        label: { class: "options_apihost", text: "后端请求地址<p>(为空时使用默认后端)" },
        input: {
          type: "url", id: "options_apihost", inputPlaceholder: "无法携带cookie，填写完整url",
        }
      },
      {
        label: { class: "options_token", text: "SESSDATA<p>(为空时:登录今日头条自动获取)</p>" },
        input: {
          type: "text", id: "options_token", inputPlaceholder: "SESSDATA值",
        }
      },
      {
        label: { class: "options_CSRF", text: "CSRF<p>(为空时:登录今日头条自动获取)</p>" },
        input: {
          type: "text", id: "options_CSRF", inputPlaceholder: "CSRF值",
        }
      },
      {
        additionalElement: [
          `<div class="alert alert-warning" role="alert">如果你不希望程序自动获取cookie,请随便填写内容或填写准备好的SESSDATA,CSRF。</div>`
        ]
      },
    ];


    const html_exeCORSForm = `
    <div class="form-group CorsForm">
      <label for="options_proxy_server" class="options_proxy_server">` + chrome.i18n.getMessage("options_proxy_server") + `
      </label>
      <input type="url" class="form-control box-shadow" id="options_proxy_server" placeholder="` + chrome.i18n.getMessage("options_proxy_server_placeholder") + `" />
    </div>`

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
    const s3_cors = ` 
    <div class="CorsButton" id="Object_Storage_cors">
     <button type="button" class="css-button-rounded--sky">` + chrome.i18n.getMessage("Object_Storage_cors_S3") + `</button>
    </div>
    `
    const programConfig = {
      Lsky: {
        needUid: 1,
        html: createFormGroups(lskyCustomFormGroup),
        config: ["options_host", "options_token", "options_permission_select"],
        init: function () {
          GetSource()
          Getalbums()
        },
      },
      EasyImages: {
        needUid: 2,
        html: createFormGroups(EasyImagesCustomFormGroup),
        config: ["options_host", "options_token"],
        init: function () {
        },
      },
      ImgURL: {
        needUid: 3,
        html: createFormGroups(ImgURLCustomFormGroup),
        config: ["options_host", "options_token", "options_uid"],
        init: function () {
        },
      },
      SM_MS: {
        needUid: 4,
        html: createFormGroups(SM_MSCustomFormGroup),
        config: ["options_token"],
        init: function () {
          $('#options_host').val("sm.ms")
          $('#options_host').attr("disabled", true)
        },
      },
      Chevereto: {
        needUid: 5,
        html: createFormGroups(CheveretoCustomFormGroup),
        config: ["options_host", "options_token", "options_album_id", "options_expiration_select", "options_nsfw_select"],
        init: function () {
        },
      },
      Hellohao: {
        needUid: 6,
        html: createFormGroups(HellohaoCustomFormGroup),
        config: ["options_host", "options_token", "options_source"],
        init: function () {
          $("#options_host").val(ProgramConfigurations.options_host);
          $("#options_token").val(ProgramConfigurations.options_token);
          $("#options_source").val(ProgramConfigurations.options_source);

        },
      },
      Imgur: {
        needUid: 7,
        html: createFormGroups(ImgurCustomFormGroup),
        config: ["options_token"],
        init: function () {
          $('#options_host').val("api.imgur.com")
          $('#options_host').attr("disabled", true)
          options_imgur_post_modeFn()
        },
      },
      UserDiy: {
        needUid: 8,
        html: createFormGroups(UserCustomFormGroup),
        config: ["options_apihost", "options_parameter", "options_Headers", "options_Body", "options_return_success", "custom_ReturnPrefix", "custom_ReturnAppend", "Keyword_replacement1", "Keyword_replacement2"],
        init: function () {
          // JSON转换
          UserDiy_customSwitch()
        },
      },
      Tencent_COS: {
        needUid: 9,
        html: createFormGroups(Tencent_COSCustomFormGroup),
        config: ["options_SecretId", "options_SecretKey", "options_Bucket", "options_AppId", "options_Region", "options_UploadPath", "options_Custom_domain_name"],
        init: function () {
          $("#CorsButton").parent().append(cos_cors)
          $("#CorsButton").parent().append(cos_putBucketACL)
          setBucketACL()
          setBucketCors()
          if ($('#CorsButton button').is(".css-button-rounded--red")) {
            Close_CORS_Element()
          }
        },
      },
      Aliyun_OSS: {
        needUid: 10,
        html: createFormGroups(Aliyun_OSSCustomFormGroup),
        config: ["options_SecretId", "options_SecretKey", "options_Bucket", "options_Endpoint", "options_Region", "options_UploadPath", "options_Custom_domain_name"],
        init: function () {
          $("#CorsButton").parent().append(oss_cors)
          $("#CorsButton").parent().append(oss_putBucketACL)
          setBucketACL()
          setBucketCors()
          if ($('#CorsButton button').is(".css-button-rounded--red")) {
            Close_CORS_Element()
          }
        },
      },
      AWS_S3: {
        needUid: 11,
        html: createFormGroups(AWS_S3CustomFormGroup),
        config: ["options_SecretId", "options_SecretKey", "options_Bucket", "options_Region", "options_Endpoint", "options_UploadPath", "options_Custom_domain_name"],
        init: function () {
          $("#CorsButton").parent().append(s3_cors)
          setBucketCors()
          if ($('#CorsButton button').is(".css-button-rounded--red")) {
            Close_CORS_Element()
          }
        },
      },
      GitHubUP: {
        needUid: 12,
        html: createFormGroups(GitHubUPCustomFormGroup),
        config: ["options_owner", "options_repository", "options_UploadPath", "options_token"],
        init: function () {
        },
      },
      Telegra_ph: {
        needUid: 13,
        html: createFormGroups(Telegra_phCustomFormGroup),
        config: ["options_Custom_domain_name"],
        init: function () {
          $("#options_Custom_domain_name").val(ProgramConfigurations.options_Custom_domain_name);
        },
      },
      imgdd: {
        needUid: 14,
        html: createFormGroups(imgddCustomFormGroup),
        init: function () {
          $('#options_host').val("imgdd.com")
          $('#options_host').attr("disabled", true)
        },
      },
      fiftyEight: {
        needUid: 15,
        html: createFormGroups(fiftyEightCustomFormGroup),
        init: function () {
          // 默认初始化代码
        },
      },
      BilibliBed: {
        needUid: 16,
        html: createFormGroups(BilibliBedCustomFormGroup),
        config: ["options_token", "options_CSRF"],
        init: function () {
          $("#options_token").val(ProgramConfigurations.options_token);
          $("#options_CSRF").val(ProgramConfigurations.options_CSRF);
        },
      },
      BaiJiaHaoBed: {
        needUid: 17,
        html: createFormGroups(BaiJiaHaoBedCustomFormGroup),
        init: function () {
          // 默认初始化代码
        },
      },
      freebufBed: {
        needUid: 18,
        html: createFormGroups(freebufBedCustomFormGroup),
        init: function () {
          // 默认初始化代码
        },
      },
      toutiaoBed: {
        needUid: 19,
        html: createFormGroups(toutiaoBedCustomFormGroup),
        init: function () {
          // 默认初始化代码
        },
      },
      toutiaoBed2: {
        needUid: 20,
        html: createFormGroups(toutiaoBed2CustomFormGroup),
        init: function () {
          // 默认初始化代码
        },
      },
      default: {
        html: `
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
              <img src="https://cdn-us.imgs.moe/2023/07/04/64a414574dba6.gif">
              <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
                <h1>` + chrome.i18n.getMessage("You_know_what") + `</h1>
                <p>` + chrome.i18n.getMessage("You_know_what_1") + `</p>
              </div>
            </div>
            <div class="carousel-item">
              <img src="https://cdn-us.imgs.moe/2023/07/04/64a4145276e67.gif" loading="lazy">
              <div class="carousel-caption d-none d-md-block" style="color: #fb06ff;">
                <h1>` + chrome.i18n.getMessage("You_know_what") + `</h1>
                <p>` + chrome.i18n.getMessage("You_know_what_2") + `</p>
              </div>
            </div>
            <div class="carousel-item">
              <img src="https://cdn-us.imgs.moe/2023/07/04/64a414475a4ec.gif" loading="lazy">
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
        `,
        init: function () {
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
        },
      },
    };

    function initializeProgramOptions(programId) {
      const prog = programConfig[programId] || programConfig.default;
      $('.options-form').empty().append(prog.html);
      $("#Object_Storage_cors").remove()
      $("#putBucketACL").remove()
      $("#options_exe button").removeClass('active');
      prog.init();
      $(`#options_exe button[value=${programId}]`).addClass("active");
      $('#options-form').hide().slideDown('slow');
      $(".options-form input[name='requestMethod'][value='" + ProgramConfigurations.requestMethod + "']").prop('checked', true);
      $('textarea').on('input', function () {
        this.style.height = (this.scrollHeight) + 'px'; // 根据内容的滚动高度来设置文本域的高度
      });
      $('textarea').each(function () {
        this.style.height = (this.scrollHeight) + 'px';
      });

      $("input[required]").each(function () {
        // 获取对应的 label 元素
        let label = $("label[for='" + $(this).attr("id") + "']");
        // 在 label 元素的文本之前添加星号
        label.prepend("<span class='required-marker'> *</span>");
      });

      if (prog.config) {
        chrome.storage.local.get(['ProgramConfiguration'], function (result) {
          const programConfiguration = result.ProgramConfiguration || {};
          for (const key of prog.config) {
            if (programConfiguration.hasOwnProperty(key)) {
              $(`#${key}`).val(programConfiguration[key]);
            }
          }

        });
      }

      // 判断 CORS 开关
      chrome.storage.local.get(["ProgramConfiguration"], function (result) {
        if (ProgramConfigurations.options_proxy_server_state === 1) {
          Insert_CORS_Element();
        }
      });

    }
    initializeProgramOptions(ProgramConfigurations.options_exe)
    $(`#options_exe button[value=${ProgramConfigurations.options_exe}] span`).addClass("selected");
    // 按钮点击事件委托
    $('#options_exe button').on('click', function () {
      const progId = $(this).attr("id").replace("exe_", "");
      initializeProgramOptions(progId);
    });
    function setBucketCors() {
      $("#Object_Storage_cors").click(function () {
        switch (ProgramConfigurations.options_exe) {
          case 'Tencent_COS':
            if ($('#exe_Tencent_COS').hasClass('active')) {
              setCosBucketCors();
            } else {
              disableCorsButton();
            }
            break;
          case 'Aliyun_OSS':
            if ($('#exe_Aliyun_OSS').hasClass('active')) {
              setOssBucketCors();
            } else {
              disableCorsButton();
            }
            break;
          case 'AWS_S3':
            if ($('#exe_AWS_S3').hasClass('active')) {
              setS3BucketCors();
            } else {
              disableCorsButton();
            }
            break;
        }
      });
    }

    function setCosBucketCors() {
      function cos_putBucketCors() {
        cos.putBucketCors({
          Bucket: ProgramConfigurations.options_Bucket,
          Region: ProgramConfigurations.options_Region,
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
      cos.getBucketCors({
        Bucket: ProgramConfigurations.options_Bucket, /* 必须 */
        Region: ProgramConfigurations.options_Region,     /* 存储桶所在地域，必须字段 */
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

    function setOssBucketCors() {
      function oss_putBucketCors() {
        oss.putBucketCORS(ProgramConfigurations.options_Bucket, [{
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
      oss.getBucketCORS(ProgramConfigurations.options_Bucket).then((res) => {
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

    function setS3BucketCors() {
      function s3_putBucketCors() {
        s3.putBucketCors({
          Bucket: ProgramConfigurations.options_Bucket,
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
      s3.getBucketCors({ Bucket: ProgramConfigurations.options_Bucket }, function (err, data) {
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

    function disableCorsButton() {
      $("#Object_Storage_cors button").attr("disabled", 'true');
      toastItem({
        toast_content: chrome.i18n.getMessage("Setting_successful_3")
      });
    }

    function setBucketACL() {
      $("#putBucketACL .putBucketACL").click(function () {
        $('#putBucketACL li').addClass("list-group-item disabled");
        $('#putBucketACL li').attr("aria-disabled", true)
        switch (ProgramConfigurations.options_exe) {
          case 'Tencent_COS':
            if ($('#exe_Tencent_COS').hasClass('active')) {
              async function cos_getBucketAcl() {
                try {
                  const result = await cos.getBucketAcl({ Bucket: ProgramConfigurations.options_Bucket, Region: ProgramConfigurations.options_Region });
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
                  const result = await oss.getBucketACL(ProgramConfigurations.options_Bucket)
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
        switch (ProgramConfigurations.options_exe) {
          case 'Tencent_COS':
            async function cos_putBucketACL() {
              try {
                await cos.putBucketAcl({ Bucket: ProgramConfigurations.options_Bucket, Region: ProgramConfigurations.options_Region, ACL: acl });
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
                await oss.putBucketACL(ProgramConfigurations.options_Bucket, acl)
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
      if (ProgramConfigurations.options_host) {//不为空时
        fetch(ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v1/strategies", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': ProgramConfigurations.options_token
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
                storProgramConfiguration({ 'options_source_select': $("#options_source_select").val() })
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
      if (ProgramConfigurations.options_host) {//不为空时
        fetch(ProgramConfigurations.options_proxy_server + "https://" + ProgramConfigurations.options_host + "/api/v1/albums", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': ProgramConfigurations.options_token
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
                storProgramConfiguration({ 'options_album_id': $("#options_album_id").val() })
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
          storProgramConfiguration({ 'options_imgur_post_mode': 1 })
          // 开启
          toastItem({
            toast_content: chrome.i18n.getMessage("Video_upload_mode"),
          })

        } else {
          storProgramConfiguration({ 'options_imgur_post_mode': 0 })
          // 关闭
          toastItem({
            toast_content: chrome.i18n.getMessage("Image_upload_mode"),
          })
        }
      });

      // 判断模式
      chrome.storage.local.get(["options_imgur_post_mode"], function (result) {
        if (result.options_imgur_post_mode == 1) {
          $('#options_imgur_post_mode').attr('checked', true);
        }
      })
    }
    // 保存配置
    $("#options-form").submit(function (event) {
      event.preventDefault(); // 阻止表单的默认提交行为
      SaveFunction()
    });
    function SaveFunction() {
      let optionsExe = $("#options_exe button.active");
      if (optionsExe.length) {
        let proxyServer = $('#options_proxy_server');
        let FormData = new Object;

        if (proxyServer.val() == "") {
          toastItem({
            toast_content: chrome.i18n.getMessage("CORS_proxy_cannot_be_empty")
          })
          return;
        }
        if ($('#exe_Telegra_ph').hasClass('active')) {
          FormData['options_host'] = "telegra.ph"
        }

        $(".options-form input").each(function () {
          if (this.type === "radio") {
            if ($(this).is(':checked')) {
              FormData[this.name] = $(this).val()
            }
          } else if (this.type === "checkbox") {
            FormData[this.id] = $(this).is(':checked')
          } else {
            FormData[this.id] = $(this).val()
          }
        });


        $(".options-form select").each(function () {
          FormData[this.id] = $(this).val()
        });

        $(".options-form textarea").each(function () {
          FormData[this.id] = $(this).val()
        });

        if ($("#options_UploadPath")) {
          let PathString = $("#options_UploadPath").val()
          if (!PathString) {
            FormData['options_UploadPath'] = ""
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
            FormData['options_UploadPath'] = PathString
          }
        }
        if ($('#exe_Lsky').hasClass('active')) {
          let string = $("#options_token").val()
          let pattern = /^Bearer\s/;
          if (pattern.test(string)) {
            FormData['options_token'] = $("#options_token").val()
          } else {
            FormData['options_token'] = `Bearer ` + string
          }
        }
        if ($('#exe_Imgur').hasClass('active')) {
          FormData['options_imgur_post_mode'] = $('#options_imgur_post_mode').is(':checked')
        }
        if ($('#exe_UserDiy').hasClass('active')) {
          FormData['options_host'] = $("#options_apihost").val()
        }
        if ($('#exe_fiftyEight').hasClass('active')) {
          FormData['options_host'] = "cn.58.com"
        }
        // if ($('#exe_BilibliBed').hasClass('active')) {
        //   chrome.runtime.sendMessage({ exe_BilibliBed: "save" });
        // }
        if ($('#exe_BaiJiaHaoBed').hasClass('active')) {
          FormData['options_host'] = "baijiahao.baidu.com"
        }
        if ($('#exe_freebufBed').hasClass('active')) {
          FormData['options_host'] = "www.freebuf.com"
        }
        if ($('#exe_toutiaoBed').hasClass('active') || $('#exe_toutiaoBed2').hasClass('active')) {
          FormData['options_host'] = "www.toutiao.com"
        }
        localStorage.options_webtitle_status = 1
        toastItem({
          toast_content: chrome.i18n.getMessage("Successfully_saved_1")
        })
        FormData["options_exe"] = optionsExe.attr("value")
        storProgramConfiguration(FormData)
        storeBedConfig(FormData);
      } else {
        toastItem({
          toast_content: chrome.i18n.getMessage("select_upload_program")
        })
      }
    }
    function sortObjectProperties(obj) {
      // 数据排序
      const sortedObj = {};
      const sortedKeys = Object.keys(obj).sort();

      for (const key of sortedKeys) {
        sortedObj[key] = obj[key];
      }

      return sortedObj;
    }
    function storeBedConfig(data) {
      const sortedData = sortObjectProperties(data);
      dbHelper("BedConfigStore").then(result => {
        // 处理获取到的配置数据
        const { db } = result;
        db.getAll().then(BedConfig => {
          let existingData = BedConfig.find(existingData => isSameData(existingData.data, sortedData));
          if (existingData) {
            // 找到相同数据，更新它
            existingData.data = sortedData; // 或者根据需要更新其他属性
            db.put(existingData).then(() => {
              console.log("Data updated successfully");
            }).catch(error => {
              console.error("Error in updating data:", error);
            });
          } else {
            // 没有相同数据，添加新的数据项
            const uniqueId = generateUniqueId();
            const configData = {
              id: uniqueId,
              data: sortedData,
              ConfigName: chrome.i18n.getMessage("Config") + BedConfig.length,
            };
            db.put(configData).then(() => {
              console.log("Data added successfully with ID:", uniqueId);
            }).catch(error => {
              console.error("Error in adding data:", error);
            });
          }
          setTimeout(function () {
            window.location.reload();
          }, 1500); // 延迟 1.5 秒（1500 毫秒）
        })

      }).catch(error => {
        console.error("Error opening database:", error);
        $(".Config-Box-Log-content").html(`<p class="text-center">该浏览器不支持此功能</p>`);
      });
    }

    //延迟1秒


    function generateUniqueId() {
      return crypto.randomUUID();
    }

    function isSameData(data1, data2) {
      //非常重要，判断是否相同
      const excludedProps = ['ConfigName'];
      for (const key of Object.keys(data2)) {
        if (!excludedProps.includes(key) && data1[key] !== data2[key]) {
          return false;
        }
      }
      return true;
    }
    async function readBedConfig() {
      unregisterDragSortEvents(); //注销绑定监听

      dbHelper("BedConfigStore").then(result => {
        const { db } = result;
        $(".Config-Box-Log-content").empty();
        attachImportButtonHandler(db); // 导入
        db.getSortedByIndex().then(BedConfig => {
          if (BedConfig.length === 0) {
            $(".Config-Box-Log-content").html(`
                    <div class="Config-Box-Log-item">
                        <div class="BedConfigName"><span>No Data</span></div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="BedConfigAdd button"><i class="bi bi-plus-circle"></i></span>
                            <span class="BedConfigDel button"><i class="bi bi-x-circle"></i></span>
                        </div>
                    </div> 
                `);
            return;
          }
          BedConfig.forEach((e, index) => {
            const item = createConfigItem(e, index);
            $(".Config-Box-Log-content").append(item);
            attachEventHandlers(item, e, db);
          });
          attachShareButtonHandler(BedConfig);
          DragSort(BedConfig, db); //拖拽api
        });

      }).catch(error => {
        console.error(error);
        $(".Config-Box-Log-content").html(`<p class="text-center">该浏览器不支持此功能</p>`);
      });
    }
    /**
     * 注销所有监控，防止重复加载
     */
    function unregisterDragSortEvents() {
      $('.Config-Box-Log-content').off('dragstart dragenter dragover dragend');
      $(".BedConfigAdd").off("click");
      $(".BedConfigShare").off("click");
      $(".BedConfigDel").off("click");
      $(".BedConfigName span").off("dblclick");
      $(".Config-Box-Log-footer .share-button").off("click"); //分享配置
      $("#ImportConfigurationPopup .replace").off("click");
      $("#ImportConfigurationPopup .append").off("click");
    }
    /**
     * 配置项元素
     */
    function createConfigItem(data, index) {
      const item = $(`
          <div class="Config-Box-Log-item" data-index="${index}"  draggable="true">
            <div class="BedConfigName" title="${data.data.options_exe}">
              <span data-old-value="${data.ConfigName}" title="` + chrome.i18n.getMessage("DoubleClickToEdit") + `">${data.ConfigName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <button type="button" class="BedConfigAdd button" title="`+ chrome.i18n.getMessage("Load") + `:[${data.ConfigName}|${data.data.options_exe}]">
                <i class="bi bi-plus-circle"></i>
              </button>
              <button type="button" class="BedConfigShare button" title="`+ chrome.i18n.getMessage("share") + `:[${data.ConfigName}|${data.data.options_exe}]">
                <i class="bi bi-send"></i>
              </button>
              <button type="button" class="BedConfigDel button" title="`+ chrome.i18n.getMessage("Delete") + `:[${data.ConfigName}|${data.data.options_exe}]">
                <i class="bi bi-x-circle"></i>
              </button>
            </div>
          </div>
        `);
      return item;
    }
    /**
     * 配置项元素按钮方法
     */
    function attachEventHandlers(item, data, db) {
      // 获取配置项中的各个按钮元素
      const addBtn = item.find(".BedConfigAdd");
      const shareBtn = item.find(".BedConfigShare");
      const delBtn = item.find(".BedConfigDel");
      const nameSpan = item.find(".BedConfigName span");

      // 为加载按钮添加点击事件处理程序
      addBtn.click(function () {
        $(this).prop('disabled', true);
        storProgramConfiguration(data.data)
          .then(() => {
            toastItem({
              toast_content: chrome.i18n.getMessage("Load") + chrome.i18n.getMessage("successful")
            });
            setTimeout(function () {
              window.location.reload();
            }, 1000); // 延迟
          })
          .catch((error) => {
            console.log(error);
          });
      });

      // 为分享按钮添加点击事件处理程序
      shareBtn.click(function () {
        $(this).prop('disabled', true);
        const newData = { ...data } //复制对象
        delete newData.id
        delete newData.index
        const textarea = document.createElement("textarea");
        textarea.value = JSON.stringify(newData);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toastItem({
          toast_content: chrome.i18n.getMessage("SharePrompt1")
        });
        setTimeout(function () {
          shareBtn.prop('disabled', false);
        }, 1000); // 延迟
      });

      // 为删除按钮添加点击事件处理程序
      delBtn.click(function () {
        $(this).prop('disabled', true);
        db.delete(data.id).then(() => {
          $(this).parent().parent().remove();
          toastItem({
            toast_content: chrome.i18n.getMessage("Delete_successful")
          });

          if ($(this).parent().parent().parent().find(".Config-Box-Log-item").length < 1) {
            return readBedConfig();
          }
        }).catch(error => {
          toastItem({
            toast_content: "好像删除失败了,打开开发者工具查看错误原因"
          });
          console.log(error);
        });
      });

      // 为配置项名称添加双击事件处理程序
      nameSpan.dblclick(function () {
        const oldValue = $(this).data("old-value");
        const newValue = prompt(chrome.i18n.getMessage("EnterConfigurationName") + ":", oldValue);
        if (newValue !== null && newValue !== "") {
          $(this).text(newValue);
          $(this).data("old-value", newValue);
          data.ConfigName = newValue;
          db.put(data).then(() => {
            toastItem({
              toast_content: chrome.i18n.getMessage("Save") + chrome.i18n.getMessage("successful")
            });
          });
        }
      });
    }
    /**
     * 分享按钮方法
     */
    function attachShareButtonHandler(BedConfig) {
      $(".Config-Box-Log-footer .share-button").click(function () {
        const modifiedBedConfig = BedConfig.map(({ id, index, ...rest }) => rest);
        const textarea = document.createElement("textarea");
        textarea.value = JSON.stringify(modifiedBedConfig);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toastItem({
          toast_content: chrome.i18n.getMessage("SharePrompt1")
        });
      });
    }
    /**
     * 导入配置 内容判定
     */
    function parseJsonInput(inputValue) {
      return new Promise((resolve, reject) => {
        if (!inputValue || inputValue.trim() == "") {
          return reject("导入配置:输入内容为空");
        }
        try {
          // 检查是否需要将输入包裹在数组中
          if (inputValue.trim().startsWith('{') && inputValue.trim().endsWith('}')) {
            inputValue = '[' + inputValue + ']';
          }
          // 尝试将字符串解析为JSON
          let jsonArray = JSON.parse(inputValue);
          // 检测解析后的值是否为数组或对象
          if (Array.isArray(jsonArray) || (typeof jsonArray === 'object' && jsonArray !== null)) {
            if (jsonArray.length === 0) { return; }
            let newArray = []
            for (const item of jsonArray) {
              if (Object.keys(item).length === 0) {
                continue;
              }
              if (!item.data) {
                const newItem = { ...item }
                delete newItem.ConfigName
                delete newItem.ConfigTime
                newArray.push({
                  id: generateUniqueId(),
                  data: newItem,
                  ConfigName: item.ConfigName || chrome.i18n.getMessage("Config"),
                });

              } else {
                newArray.push({ ...item, id: generateUniqueId() });
              }

            }
            resolve(newArray)
            if (newArray.length === 1) {
              storProgramConfiguration(newArray[0].data)
                .then(() => {
                  toastItem({
                    toast_content: chrome.i18n.getMessage("Load") + chrome.i18n.getMessage("successful")
                  });
                  localStorage.options_webtitle_status = 1
                  setTimeout(function () {
                    window.location.reload();
                  }, 1000); // 延迟
                });
            }
          } else {
            reject("导入配置:无法处理数据,请查看报错!");
          }
        } catch (error) {
          console.error(error);
          reject("导入配置:转换或者数据处理过程中出错了,详细错误请查看开发者工具(F12)!");
        }
      })
    }
    /**
    * 导入配置按钮方法
    */
    function attachImportButtonHandler(db) {
      let item = $("#ImportConfigurationPopup");
      if (!$("#ImportConfigurationPopup").length) {
        item = $(`
                      <div class="modal fade" id="ImportConfigurationPopup" tabindex="-1" aria-labelledby="ImportConfigurationPopupLabel"
                      aria-hidden="true">
                      <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-header">
                            <h1 class="modal-title fs-5" id="ImportConfigurationPopupLabel">`+ chrome.i18n.getMessage("ImportConfiguration") + `</h1>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div class="modal-body">
                            <div class="form-floating">
                              <textarea class="form-control" placeholder="配置信息" id="floatingTextarea"></textarea>
                              <label for="floatingTextarea">多段数据使用,分割!</label>
                            </div>
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary close" data-bs-dismiss="modal">`+ chrome.i18n.getMessage("close") + `</button>
                            <button type="button" class="btn btn-primary replace" data-i18n="replace">`+ chrome.i18n.getMessage("replace") + `</button>
                            <button type="button" class="btn btn-primary append" data-i18n="append">`+ chrome.i18n.getMessage("append") + `</button>
                          </div>
                        </div>
                      </div>
                    </div>
                      `)
        $("body").append(item)
      }
      item.find(".append").click(function () {
        let value = item.find("#floatingTextarea").val();
        parseJsonInput(value).then(newArray => {
          db.add(newArray).then(() => {
            item.find("#floatingTextarea").val("");
            readBedConfig();
          }).catch(error => {
            console.error("Error replacing data:", error);
          });
        }).catch(error => {
          toastItem({
            toast_content: error
          });
          console.error(error);
        });

      });
      item.find(".replace").click(function () {
        let value = item.find("#floatingTextarea").val();
        parseJsonInput(value).then(newArray => {
          db.clear().then(() => {
            db.add(newArray).then(() => {
              item.find("#floatingTextarea").val("");
              readBedConfig();
            }).catch(error => {
              console.error("Error replacing data:", error);
            });
          });
        }).catch(error => {
          toastItem({
            toast_content: error
          });
          console.error(error);
        });

      })
    }
    /**
     * 配置项目拖拽方法
     */
    function DragSort(bedConfig, db) {
      let list = $('.Config-Box-Log-content');
      let currentLi;
      // 当开始拖拽列表项时触发的事件处理函数
      list.on('dragstart', '.Config-Box-Log-item', function (e) {
        // 设置拖拽效果
        e.originalEvent.dataTransfer.effectAllowed = 'move';
        // 记录当前拖拽的列表项
        currentLi = $(this);
        setTimeout(() => {
          currentLi.addClass('moving');
        });
      });

      // 当鼠标进入其他列表项时触发的事件处理函数
      list.on('dragenter', '.Config-Box-Log-item', function (e) {
        e.preventDefault();
        if ($(this).is(currentLi)) {
          return;
        }
        let liArray = list.find('.Config-Box-Log-item');
        // 获取当前拖拽项的索引和目标项的索引
        let currentIndex = liArray.index(currentLi);
        let targetIndex = liArray.index($(this));

        if (currentIndex < targetIndex) {
          // 如果目标在当前项的下方，将当前项插入目标项的后面
          $(this).after(currentLi);
        } else {
          // 如果目标在当前项的上方，将当前项插入目标项的前面
          $(this).before(currentLi);
        }
      });
      list.on('dragover', '.Config-Box-Log-item', function (e) {
        e.preventDefault();
      });
      list.on('dragend', '.Config-Box-Log-item', function (e) {
        currentLi.removeClass('moving');
        // 获取已排序的 Config-Box-Log-item 元素的顺序
        let sortedItems = list.find('.Config-Box-Log-item');
        let newOrder = [];
        sortedItems.each(function () {
          newOrder.push($(this).data('index'));
        });

        let rearrangedBedConfig = newOrder.map(index => {
          let item = Object.assign({}, bedConfig[index]);
          item.index = newOrder.indexOf(index);
          return item;
        });
        db.put(rearrangedBedConfig).then(() => {
        }).catch(error => {
          console.error("Error updating data:", error);
        });

      });

    }

    readBedConfig();
    /**
     * 统一插入CORS元素
     */
    function Insert_CORS_Element() {
      $("#CorsButton button").removeClass("css-button-rounded--black")
      $("#CorsButton button").addClass('css-button-rounded--red');
      $('.options-form').append(html_exeCORSForm)
      $('.CorsForm').hide().slideDown('slow');
      $('#options_proxy_server').val(ProgramConfigurations.options_proxy_server);
      if ($('#options_proxy_server').val() == "undefined") {
        $('#options_proxy_server').val("")
      }
      storProgramConfiguration({ 'options_proxy_server_state': 1 })
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
      storProgramConfiguration({ 'options_proxy_server_state': 0 })
    }

    // 开启配置CORS 按钮
    $('#CorsButton').click(function () {
      if ($('#exe_Tencent_COS').hasClass('active') || $('#exe_Aliyun_OSS').hasClass('active') || $('#exe_AWS_S3').hasClass('active')) {
        toastItem({
          toast_content: chrome.i18n.getMessage("Unable_configure_CORS_proxy")
        });
        return;
      }

      if ($('#CorsButton button').is(".css-button-rounded--red")) {
        Close_CORS_Element();
        toastItem({
          toast_content: chrome.i18n.getMessage("CORS_proxy_closed")
        });
      } else {
        Insert_CORS_Element();
        toastItem({
          toast_content: chrome.i18n.getMessage("CORS_proxy_opened")
        });
      }
    });


    function UserDiy_customSwitch() {
      const stor = [
        "open_json_button",
        "custom_KeywordReplacement",
        "custom_Base64Upload",
        "custom_Base64UploadRemovePrefix",
        "custom_BodyUpload",
        "custom_BodyStringify"
      ];
      chrome.storage.local.get(['ProgramConfiguration'], function (result) {
        const programConfiguration = result.ProgramConfiguration || {};

        for (const key of stor) {
          if (programConfiguration.hasOwnProperty(key)) {
            if (programConfiguration[key] == 1) {
              $(`#${key}`).attr('checked', true);
            }

          }
        }

      });
    }


    $("#Sidebar_area").hover(function () {
      //自定义图标区域

      let uploadArea_width = uploadArea.uploadArea_width
      let uploadArea_height = uploadArea.uploadArea_height
      let uploadArea_Location = uploadArea.uploadArea_Location
      let uploadArea_opacity = uploadArea.uploadArea_opacity
      let uploadArea_auto_close_time = uploadArea.uploadArea_auto_close_time
      let uploadArea_Left_or_Right = uploadArea.uploadArea_Left_or_Right

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
                  <label for="uploadArea_width" class="form-label">`+ chrome.i18n.getMessage("width") + `:0px</label>
                  <input type="range" class="form-range" min="16" max="100" id="uploadArea_width">
                </div>
                <div>
                  <label for="uploadArea_height" class="form-label">`+ chrome.i18n.getMessage("height") + `:0%</label>
                  <input type="range" class="form-range" min="1" max="100" id="uploadArea_height">
                </div>
                <div>
                  <label for="uploadArea_Location" class="form-label">`+ chrome.i18n.getMessage("Location") + `:0</label>
                  <input type="range" class="form-range" min="1" max="100" id="uploadArea_Location" disabled>
                </div>
                <div>
                  <label for="uploadArea_opacity" class="form-label">`+ chrome.i18n.getMessage("opacity") + `:0</label>
                  <input type="range" class="form-range" min="5" max="100" id="uploadArea_opacity">
                </div>
                <div>
                  <label for="uploadArea_auto_close_time" class="form-label">`+ chrome.i18n.getMessage("auto_close_time") + `:2s</label>
                  <input type="range" class="form-range" min="2" max="100" id="uploadArea_auto_close_time">
                </div>
                <div style="display: flex;">
                  <label for="uploadArea_Left_or_Right" class="form-label" style="margin-right: .5rem;">`+ chrome.i18n.getMessage("uploadArea_Left_or_Right") + `:</label>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="uploadArea_Left_or_Right" id="uploadArea_Left" value="Left">
                    <label class="form-check-label" for="inlineRadio1">`+ chrome.i18n.getMessage("Left") + `</label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="uploadArea_Left_or_Right" id="uploadArea_Right" value="Right">
                    <label class="form-check-label" for="inlineRadio2"> `+ chrome.i18n.getMessage("Right") + `</label>
                  </div>
                </div>
              </div>
              <div style="width: 125px;"></div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="bi bi-x-lg"></i>`+ chrome.i18n.getMessage("close") + `</button>
              <button type="button" class="btn btn-danger" id="uploadArea_reset" data-bs-dismiss="modal"><i
                  class="bi bi-arrow-repeat"></i>`+ chrome.i18n.getMessage("reset") + `</button>
              <button type="button" class="btn btn-primary" id="uploadArea_save"><i
                  class="bi bi-check-lg"></i>`+ chrome.i18n.getMessage("save") + `</button>
            </div>
          </div>
        </div>
        </div>
        `)
        let uploadArea_width_value //宽度
        let uploadArea_height_value //高度
        let uploadArea_Location_value //位置
        let uploadArea_opacity_value //透明度
        let uploadArea_auto_close_time_value //自动关闭时间


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
            uploadArea_Location_value = parseInt(dragPos / (parentHeight / 100));
            $("#uploadArea_Location").prev('label').text(chrome.i18n.getMessage("Location") + ":" + uploadArea_Location_value + "%");
            uploadArea_Location = uploadArea_Location_value
            edit_uploadArea.css("top", dragPos);
            uploadAreaParent.scrollTop(dragPos);
          }
        });

        // 监听鼠标松开事件
        $(document).mouseup(function () {
          isDragging = false;
        });
        // 宽度
        edit_uploadArea.css('width', uploadArea_width + 'px');
        $("#uploadArea_width").attr("value", uploadArea_width)
        $("#uploadArea_width").prev('label').text(chrome.i18n.getMessage("width") + ':' + uploadArea_width + "px");
        // 高度

        edit_uploadArea.css('height', uploadArea_height + '%');
        $("#uploadArea_height").attr("value", uploadArea_height)
        $("#uploadArea_height").prev('label').text(chrome.i18n.getMessage("height") + ':' + uploadArea_height + "%");
        switch (uploadArea_Left_or_Right) {
          case 'Left':
            if (uploadArea_height > 99) {
              edit_uploadArea.css("border-radius", "0px 10px 10px 0px")
            } else {
              edit_uploadArea.css("border-radius", "0")
            }
            break;
          case 'Right':
            if (uploadArea_height > 99) {
              edit_uploadArea.css("border-radius", "10px 0px 0px 10px")
            } else {
              edit_uploadArea.css("border-radius", "0")
            }
            break;
        }

        //位置
        edit_uploadArea.css('top', (uploadArea_Location * ($("#PNGmodal-body").height() / 100)) + 'px');
        $("#uploadArea_Location").attr("value", uploadArea_Location)
        $("#uploadArea_Location").prev('label').text(chrome.i18n.getMessage("Location") + ':' + (uploadArea_Location) + "%");

        //透明
        edit_uploadArea.css("background-color", `rgba(60,64,67,` + uploadArea_opacity + `)`)
        $("#uploadArea_opacity").attr("value", uploadArea_opacity * 100)
        $("#uploadArea_opacity").prev('label').text(chrome.i18n.getMessage("opacity") + ':' + uploadArea_opacity);

        //自动关闭时间
        $("#uploadArea_auto_close_time").attr("value", uploadArea_auto_close_time)
        $("#uploadArea_auto_close_time").prev('label').text(chrome.i18n.getMessage("auto_close_time") + ':' + uploadArea_auto_close_time + "s");
        switch (uploadArea_Left_or_Right) {
          case 'Left':
            $("#uploadArea_Left").attr("checked", true)
            edit_uploadArea.css("left", "0");
            break;
          case 'Right':
            $("#uploadArea_Right").attr("checked", true)
            edit_uploadArea.css("right", "0");
            break;
        }

        $("#uploadArea_Left").click(function () {
          uploadArea_Left_or_Right = "Left"
          edit_uploadArea.css("left", "0");
          if (uploadArea_height > 99) {
            edit_uploadArea.css("border-radius", "0px 10px 10px 0px")
          } else {
            edit_uploadArea.css("border-radius", "0")
          }
        })
        $("#uploadArea_Right").click(function () {
          uploadArea_Left_or_Right = "Right"
          edit_uploadArea.css("left", uploadAreaParent.width() - edit_uploadArea.width() + "px");
          if (uploadArea_height > 99) {
            edit_uploadArea.css("border-radius", "10px 0px 0px 10px")
          } else {
            edit_uploadArea.css("border-radius", "0")
          }
        })

        $('#uploadArea_width').on('input', function () {
          uploadArea_width_value = $(this).val();
          $(this).prev('label').text(chrome.i18n.getMessage("width") + ':' + uploadArea_width_value + "px");
          edit_uploadArea.css('width', uploadArea_width_value + 'px');
          uploadArea_width = uploadArea_width_value
          switch (uploadArea_Left_or_Right) {
            case 'Right':
              edit_uploadArea.css('left', uploadAreaParent.width() - uploadArea_width_value + 'px');
              break;
          }
        });

        $('#uploadArea_height').on('input', function () {
          uploadArea_height_value = $(this).val();
          let areaOffset = edit_uploadArea.offset();
          let parentOffset = edit_uploadArea.parent().offset();
          let top = areaOffset.top - parentOffset.top;
          let parentHeight = edit_uploadArea.parent().height();

          uploadArea_Location_value = parseInt((top / parentHeight) * 100);
          let from_border = uploadArea_Location_value + parseInt(uploadArea_height_value)
          $(this).prev('label').text(chrome.i18n.getMessage("height") + ':' + uploadArea_height_value + "%");
          $("#uploadArea_Location").prev('label').text(chrome.i18n.getMessage("Location") + ':' + uploadArea_Location_value + "%");
          if (from_border > 99) {
            edit_uploadArea.css("top", 0)
          }

          switch (uploadArea_Left_or_Right) {
            case 'Left':
              if (uploadArea_height_value > 99) {
                edit_uploadArea.css("border-radius", "0px 10px 10px 0px")
              } else {
                edit_uploadArea.css("border-radius", "0")
              }
              break;
            case 'Right':
              if (uploadArea_height_value > 99) {
                edit_uploadArea.css("border-radius", "10px 0px 0px 10px")
              } else {
                edit_uploadArea.css("border-radius", "0")
              }
              break;
          }

          edit_uploadArea.css('height', uploadArea_height_value + '%');
          uploadArea_height = uploadArea_height_value
          uploadArea_Location = uploadArea_Location_value

        });

        $('#uploadArea_opacity').on('input', function () {
          uploadArea_opacity_value = $(this).val() / 100;
          $("#uploadArea_opacity").prev('label').text(chrome.i18n.getMessage("opacity") + ':' + uploadArea_opacity_value);
          edit_uploadArea.css("background-color", `rgba(60,64,67,` + uploadArea_opacity_value + `)`)
          uploadArea_opacity = uploadArea_opacity_value
        });

        $('#uploadArea_auto_close_time').on('input', function () {
          uploadArea_auto_close_time_value = $(this).val();
          $("#uploadArea_auto_close_time").prev('label').text(chrome.i18n.getMessage("auto_close_time") + ':' + uploadArea_auto_close_time_value + "s");
          uploadArea_auto_close_time = uploadArea_auto_close_time_value
        });

        $("#uploadArea_save").click(function () {
          let FormData = new Object;
          $("#PNGmodal-body input").each(function () {
            if (this.type === "radio") {
              if ($(this).is(':checked')) {
                FormData[this.name] = $(this).val()
              }
            } else {
              FormData[this.id] = $(this).val()
            }
            FormData.uploadArea_opacity = $('#uploadArea_opacity').val() / 100
          });
          chrome.storage.local.set({ "uploadArea": FormData })
          toastItem({
            toast_content: chrome.i18n.getMessage("Successfully_saved_2")
          })

        })
        $("#uploadArea_reset").click(function () {
          chrome.storage.local.set({
            "uploadArea": {
              "uploadArea_width": 32,
              "uploadArea_height": 30,
              "uploadArea_Location": 34,
              "uploadArea_opacity": 0.3,
              "uploadArea_auto_close_time": 2,
              "uploadArea_Left_or_Right": "Right"
            }
          });
          toastItem({
            toast_content: chrome.i18n.getMessage("Successfully_Reset_1")
          })
        })
      }
      $("#Sidebar_area").attr("disabled", false)
    })
    document.addEventListener("keydown", function (event) {
      // 检查是否按下了Ctrl键和S键
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); // 阻止浏览器默认的保存页面行为
        SaveFunction()
      }
    });
  })//chrome get


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
    const mapping = {
      1: "Tab",
      2: "Window",
      3: "Inside",
    };

    const option = result.browser_Open_with;
    const button = $("#options_Open_withDiv button");

    if (mapping[option]) {
      $(`#options_Open_with_${mapping[option]} a`).addClass('active');
      button.html($(`#options_Open_with_${mapping[option]} a`).html());
    }

    for (const element in mapping) {
      $(`#options_Open_with_${mapping[element]}`).click(function () {
        if (element == 3) {
          if (window.navigator.userAgent.indexOf('Firefox') > -1) {
            toastItem({
              toast_content: chrome.i18n.getMessage("Setting_failed_2")
            })
            return;
          } else {
            alert(chrome.i18n.getMessage("Setting_successful_7"))
            chrome.storage.local.set({ 'browser_Open_with': element }, function () {
              // 打开方式为：在内置页打开
              chrome.runtime.reload();
            });
          }
        }
        chrome.storage.local.set({ 'browser_Open_with': element }, function () {
          chrome.runtime.reload();
        });

      });
    }
  });

  function initializeButtonOption() {
    const options = [
      "GlobalUpload",
      "AutoInsert",
      "AutoCopy",
      "Right_click_menu_upload",
      "ImageProxy",
      "EditPasteUpload",
    ];

    chrome.storage.local.get("FuncDomain", function (result) {
      FuncDomain = result.FuncDomain || {}
      options.forEach((key) => {
        const $element = $(`#${key}`);
        const $button = $element.find('button');
        const $dropdownItems = $element.find('.dropdown-item');
        if ($element.find(`a[value="${FuncDomain[key]}"]`).length) {
          $element.find(`a[value="${FuncDomain[key]}"]`).addClass("active");
        }
        if (FuncDomain[key] != "off" && FuncDomain[key]) {
          $element.addClass("on");
        } else {
          $element.addClass("off");
        }
        $dropdownItems.click(function () {
          const val = $(this).attr("value");

          $element.removeClass("on off");
          $element.addClass(val !== "off" ? "on" : "off");
          $button.removeClass("btn-primary btn-danger btn-dark");
          FuncDomain[key] = val
          addToQueue(() => {
            chrome.storage.local.set({ "FuncDomain": FuncDomain }, function () {
              if (key === "Right_click_menu_upload") {
                //延迟一秒
                setTimeout(function () {
                  chrome.runtime.reload()
                }, 500)
                  ; // 在保存完毕后执行刷新操作
              }
            });
          });
          $dropdownItems.removeClass("active");
          $(this).addClass("active");

        });
      });
    });
    $("#AutoInsert").hover(function () {
      if (!$("#insertionModal").length) {
        let item = $(`
        <select id="insertTypeOptions" style="display:none;">
        <option value="v2ex">v2ex</option>
        <option value="nodeseek">nodeseek</option>
        <option value="hostevaluate">hostevaluate</option>
        <option value="lowendtalk">lowendtalk</option>

        <option value="discuz">discuz</option>
        <option value="halo">halo</option>
        <option value="typecho">typecho</option>
        <option value="phpbb">phpbb</option>
   
        <option value="codeMirror_5">codeMirror_5</option>
        <option value="codeMirror_6">codeMirror_6</option>
        <option value="gutenberg">gutenberg</option>
        <option value="tinymce_5or6">tinymce_5or6</option>
        <option value="wangeditor">wangeditor</option>
        <option value="ckeditor_4">ckeditor_4</option>
        <option value="ckeditor_5">ckeditor_5</option>
        <option value="ckeditor_4or5">ckeditor_4or5</option>
        <option value="ueditor">ueditor</option>

        <option value="iframe">iframe</option>
      </select>
    
      <div class="modal fade modal-lg" id="insertionModal" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modalLabel">插入管理</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">域名</th>
                    <th scope="col">插入类型</th>
                    <th scope="col">操作</th>
                  </tr>
                </thead>
    
                <tbody id="tableBody"></tbody>
    
              </table>
              <hr>
              <span>小贴士:鼠标双击可以修改内容</span>
            </div>
          </div>
        </div>
      </div>
        `)
        $("body").append(item)
        $('#manageInsert').click(function () {
          $('#insertionModal').modal('show');

          chrome.storage.local.get(['InsertionEditorType'], function (result) {
            const insertionEditorType = result.InsertionEditorType || {};
            const tableBody = document.getElementById('tableBody');
            tableBody.innerHTML = ''; // Clear previous content
            Object.entries(insertionEditorType).forEach(([domain, type]) => {
              const row = tableBody.insertRow();
              const cell1 = row.insertCell(0);
              const cell2 = row.insertCell(1);
              const cell3 = row.insertCell(2);

              cell1.textContent = domain;
              cell2.textContent = type;
              let originalDomain = domain; // 保存原始域名

              // 双击编辑域名
              cell1.addEventListener('dblclick', function () {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = originalDomain;
                cell1.innerHTML = '';
                cell1.appendChild(input);
                input.focus();
                input.addEventListener('blur', function () {
                  const newDomain = input.value.trim();
                  if (newDomain && newDomain !== originalDomain) {
                    // 更新域名
                    insertionEditorType[newDomain] = insertionEditorType[originalDomain];
                    delete insertionEditorType[originalDomain];
                    originalDomain = newDomain; // 更新原始域名引用
                    chrome.storage.local.set({ 'InsertionEditorType': insertionEditorType });
                    cell1.textContent = newDomain;
                  } else {
                    cell1.textContent = originalDomain; // Revert back if empty or unchanged
                  }
                });
              });

              // 双击编辑插入类型
              cell2.addEventListener('dblclick', function () {
                const select = document.getElementById('insertTypeOptions').cloneNode(true);
                select.style.display = 'block';
                select.value = type;
                cell2.innerHTML = '';
                cell2.appendChild(select);
                select.focus();
                select.addEventListener('blur', function () {
                  const newType = select.value;
                  if (newType && newType !== type) {
                    insertionEditorType[originalDomain] = newType; // 使用原始域名更新类型
                    chrome.storage.local.set({ 'InsertionEditorType': insertionEditorType });
                    cell2.textContent = newType;
                  } else {
                    select.remove();
                    cell2.textContent = type;
                  }
                });
              });

              // 删除按钮
              const deleteButton = document.createElement('button');
              deleteButton.classList = 'btn btn-outline-danger';
              deleteButton.textContent = '删除';
              deleteButton.onclick = function () {
                tableBody.removeChild(row);
                delete insertionEditorType[domain];
                chrome.storage.local.set({ 'InsertionEditorType': insertionEditorType });
              };
              cell3.appendChild(deleteButton);
            });
          });
        })
      }
    });
  }
  initializeButtonOption()

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

  $("#StickerSave").click(function () {
    let value = $("#StickerInput").val()
    if (value) {
      chrome.storage.local.set({ "StickerURL": value })
    } else {
      chrome.storage.local.set({ "StickerURL": "https://plextension-sticker.pnglog.com/sticker.json" })
    }
    chrome.storage.local.set({ 'StickerDATA': [] }) //表情包数据
    toastItem({
      toast_content: chrome.i18n.getMessage("Successfully_saved_2")
    })
  })
  chrome.storage.local.get(["StickerURL"], function (result) {
    if (result.StickerURL != "https://plextension-sticker.pnglog.com/sticker.json") {
      $("#StickerInput").val(result.StickerURL)
    }
  })
  animation_button2('.Animation_button2').then(function () {
    overlayElement.remove()
  });

  chrome.storage.sync.get(["BedConfig"], function (result) {
    if (!result.BedConfig || result.BedConfig.length < 1) return;
    const newArray = result.BedConfig.map(item => {
      if (!item.data) {
        return {
          id: crypto.randomUUID(),
          data: item,
          ConfigName: item.ConfigName || chrome.i18n.getMessage("Config"),
        };
      } else {
        return { ...item, id: crypto.randomUUID() };
      }
    });
    dbHelper("BedConfigStore").then(result => {
      const { db } = result;
      db.put(newArray).then(() => {
        chrome.storage.sync.remove("BedConfig");
        window.location.reload();
      });
    });
  })
});

