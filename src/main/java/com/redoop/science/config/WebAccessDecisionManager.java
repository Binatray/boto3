package com.redoop.science.config;

import com.redoop.science.utils.CustomException;
import org.springframework.security.access.AccessDecisionVoter;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.ConfigAttribute;
import org.springframework.security.access.SecurityConfig;
import org.springframework.security.access.vote.AbstractAccessDecisionManager;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.FilterInvocation;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;

/**
 * @Author: Alan
 * @Time: 2018/11/12 16:19
 * @Description:
 */
public class WebAccessDecisionManager extends AbstractAccessDecisionManager {

    protected WebAccessDecisionManager(List<AccessDecisionVoter<?>> decisionVoters) {
        super(decisionVoters);
    }

    @Override
    public void decide(Authentication authentication, Object object, Collection<ConfigAttribute> configAttributes)
            throws AccessDeniedException, InsufficientAuthenticationException,CustomException {

        // 检查用户是否够权限访问资源
        // 参数authentication是从spring的全局缓存SecurityContextHolder中拿到的，里面是用户的权限信息
        // 参数object是url
        // 参数configAttributes所需的权限
        if (configAttributes == null) {
            return;
        }
        Iterator<ConfigAttribute> ite = configAttributes.iterator();
        while (ite.hasNext()) {
            ConfigAttribute ca = ite.next();
            String needRole = ((SecurityConfig) ca).getAttribute();
            for (GrantedAuthority ga : authentication.getAuthorities()) {
                if (needRole.equals(ga.getAuthority())) {
                    return;
                }
            }
        }
        // 注意：执行这里，后台是会抛异常的，但是界面会跳转到所配的access-denied-page页面
        logger.info("没有权限,拒绝访问!");
       throw new AccessDeniedException("没有权限,拒绝访问!");
//        throw  new CustomException();
    }

    @Override
    public boolean supports(ConfigAttribute attribute) {
        return true;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return FilterInvocation.class.isAssignableFrom(clazz);
    }
}
