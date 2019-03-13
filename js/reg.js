/**
 * 获取页面上的内容
 * 1.判断输入的手机号是否合法
 * 2.检查两次输入的密码是否相等
 * 3.发送至服务器，接收验证结果
 */
var register=function(){
    var phoneNum=document.getElementById("phoneNum").value
    var nickName=document.getElementById("nickName").value
    var passwd_1=document.getElementById("password_one").value
    var passwd_2=document.getElementById("password_two").value
    if(checkPhoneNum(phoneNum)&&checkPwd(passwd_1,passwd_2)&&checkNickName(nickName)){
        console.log("legal phoneNum and leagal password!")
        sendRegMsg2Server(nickName,phoneNum,passwd_1)
    }
}

/**
 * 
 * @param {String} phoneNum 
 */
var checkPhoneNum=function(phoneNum){
    var len=phoneNum.length
    if(len!=11){
        document.getElementById("phoneNumTip").style.display="block"
        return false
    }else{
        document.getElementById("phoneNumTip").style.display="none"
        return true
    }
}

/**
 * 
 * @param {String} passwd_1 
 * @param {String} passwd_2 
 */
var checkPwd=function(passwd_1,passwd_2){
    if(passwd_1.length<6){
        document.getElementById("pwdTip_one").style.display="block"
        return false
    }else{
        document.getElementById("pwdTip_one").style.display="none"
        if(passwd_1==passwd_2){
            document.getElementById("pwdTip_two").style.display="none"
            return true
        }else{
            document.getElementById("pwdTip_two").style.display="block"
            return false
        }
    }
}


/**
 * 
 * @param {String} nickName 
 */
var checkNickName=function(nickName){
    if(nickName!=""){
        document.getElementById("nameTip").style.display="none"
        return true;
    }
    else{
        document.getElementById("nameTip").style.display="block"
        return false;
    }
        
}

var sendRegMsg2Server=function(nickName,phoneNum,passwd_1){
    console.log("sendRegMsg")
    const request=new XMLHttpRequest();
    //url只用于测试，后续更改成正确的服务器URL
    const isExistenceUrl=`http://101.132.178.9/MoreTime/user/${phoneNum}/existence`
    const regUrl=`http://101.132.178.9/MoreTime/user/user/${phoneNum}/0/0/${passwd_1}/${nickName}`
    //先检查账号是否注册了
    request.open("GET",isExistenceUrl);
    request.send()
    request.onreadystatechange=(e)=>{
        if(request.readyState!==4) return;
        if(request.status===200){
            var response=JSON.parse(request.responseText)
            console.log(response)
            if(response.msg=="手机号已被注册"){
                alert("手机号已被注册！")
                return false;
            }
            if(response.msg=="Accepted"){
                var regRequest=new XMLHttpRequest()
                regRequest.open("POST",regUrl)
                regRequest.send()
                regRequest.onreadystatechange=(e)=>{
                    if(regRequest.readyState!==4) return;
                    if(regRequest.status===200){
                        var regRes=JSON.parse(regRequest.responseText)
                        console.log(regRes)
                        if(regRes.code=="201"){
                            alert("注册成功!")
                            return true
                        }else{
                            alert("注册失败！")
                            return false;
                        }
                    }
                }
            }    
        }
    }
}