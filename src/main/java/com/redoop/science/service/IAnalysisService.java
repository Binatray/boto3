package com.redoop.science.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.Analysis;

import java.util.Map;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author admin
 * @since 2018-09-26
 */
public interface IAnalysisService extends IService<Analysis> {


    String getId(Integer id);

    IPage<Analysis> pageList(Page<Analysis> page, Map<String, Object> params);

    IPage<Analysis> pageListAdmin(Page<Analysis> page);
}
