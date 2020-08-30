package com.redoop.science.config;

import org.springframework.security.access.AccessDecisionVoter;
import org.springframework.security.access.ConfigAttribute;
import org.springframework.security.core.Authentication;

import java.util.Collection;

/**
 * @Author: Alan
 * @Time: 2018/11/13 10:58
 * @Description:
 */
public class WebAccessDecisionVoter implements AccessDecisionVoter {
    @Override
    public boolean supports(ConfigAttribute attribute) {
        return true;
    }

    @Override
    public int vote(Authentication authentication, Object object, Collection collection) {
//        暂时无用以后可扩展自己的投票器
        return 0;
    }

    @Override
    public boolean supports(Class clazz) {
        return true;
    }
}
