package com.redoop.science.handler;

import com.redoop.science.entity.SysUser;
import com.redoop.science.entity.SysUserDetails;
import com.redoop.science.utils.SessionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @Author: Alan
 * @Time: 2018/10/29 10:00
 * @Description:
 */
@Component
public class RestAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {
    Logger logger = LoggerFactory.getLogger(this.getClass());
    @Autowired
    private StringRedisTemplate template;

    private String defaultTargetUrl = "/";
    private RequestCache requestCache = new HttpSessionRequestCache();
    @Override
    public void onAuthenticationSuccess(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Authentication authentication) throws IOException, ServletException {
        logger.info("登录成功,即将forward:" + this.defaultTargetUrl);
        // 登录成功之后将SECURITY放入上下文中
        SessionUtils.setUser(httpServletRequest,(SysUserDetails) SecurityContextHolder.getContext().getAuthentication() .getPrincipal());
        SessionUtils.setAttr(httpServletRequest,"context",SecurityContextHolder.getContext());
        requestCache.removeRequest(httpServletRequest, httpServletResponse);
        setAlwaysUseDefaultTargetUrl(true);
        setDefaultTargetUrl(defaultTargetUrl);
        super.onAuthenticationSuccess(httpServletRequest, httpServletResponse, authentication);
    }
}
