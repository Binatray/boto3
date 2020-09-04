package com.redoop.science.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.redoop.science.entity.RegFunction;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;
import java.util.Map;

/**
 * <p>
 * 注册函数 服务类
 * </p>
 *
 * @author Alan
 * @since 2018-10-16
 */
public interface IRegFunctionService extends IService<RegFunction> {

    String getByName(String name);

    IPage<RegFunction> pageList(Page<RegFunction> page, Map<String, Object> params);

    List<RegFunction> findByRole(Integer id);

    IPage<RegFunction> pageListAdmin(Page<RegFunction> page);
}
