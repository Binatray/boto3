
package com.redoop.science.config;

import com.redoop.science.dto.sys.SysPermissionDto;
import com.redoop.science.service.ISysPermissionService;
import com.redoop.science.utils.RedisUtil;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.ConfigAttribute;
import org.springframework.security.access.SecurityConfig;
import org.springframework.security.web.FilterInvocation;
import org.springframework.security.web.access.intercept.FilterInvocationSecurityMetadataSource;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * @Author: Alan
 * @Time: 2018/11/14 11:08
 * @Description:
 */
@Component
public class WebFilterInvocationSecurityMetadataSource implements FilterInvocationSecurityMetadataSource {
    protected final Log logger = LogFactory.getLog(getClass());
    private  Map<String, Collection<ConfigAttribute>> requestMap;

    @Autowired
    private ISysPermissionService sysPermissionService;
    @Autowired
    private RedisUtil redisUtil;

    protected void loadRequestMap(){
//        加载全部权限
//        1.项目启动时会加载全部权限到redis中
        requestMap = new HashMap<>();
//        Map<String,Set<ConfigAttribute>> redisRequestMap = redisUtil.getHashEntries("redoop.permission");
//        2.获取redis中值，若为空执行sysPermissionService，然后加载到redis
           List<SysPermissionDto> permissionDtos =  sysPermissionService.getSysPermissionDto();
//        3.转换为Map
            permissionDtos.stream().forEach(sysPermissionDto -> {
                Set<ConfigAttribute> configAttributes = new HashSet<>();
                for(String role : sysPermissionDto.getRoles()){
                    ConfigAttribute configAttribute = new SecurityConfig(role);
                    configAttributes.add(configAttribute);
                }
                requestMap.put(sysPermissionDto.getUrl(),configAttributes);
            });
    }

    @Override
    public Collection<ConfigAttribute> getAttributes(Object object) throws IllegalArgumentException {
//        参考DefaultFilterInvocationSecurityMetadataSource 实现
        if(null == requestMap) {
            loadRequestMap();
        }
        //object 中包含用户请求的request 信息
        HttpServletRequest request = ((FilterInvocation) object).getHttpRequest();
        AntPathRequestMatcher matcher;
        String resUrl;
        for(Iterator<String> iter = requestMap.keySet().iterator(); iter.hasNext(); ) {
            resUrl = iter.next();
            matcher = new AntPathRequestMatcher(resUrl);
            if(matcher.matches(request)) {
                return requestMap.get(resUrl);
            }
        }
        return null;
    }

    @Override
    public Collection<ConfigAttribute> getAllConfigAttributes() {
        Set<ConfigAttribute> allAttributes = new HashSet<>();
        if(null == requestMap) {
            loadRequestMap();
        }
        for (Map.Entry<String, Collection<ConfigAttribute>> entry : requestMap
                .entrySet()) {
            allAttributes.addAll(entry.getValue());
        }

        return allAttributes;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return FilterInvocation.class.isAssignableFrom(clazz);
    }
}