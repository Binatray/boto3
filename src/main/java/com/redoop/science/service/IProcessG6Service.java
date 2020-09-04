package com.redoop.science.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.redoop.science.entity.Analysis;
import com.redoop.science.entity.ProcessG6;

import java.util.Map;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author admin
 * @since 2019年3月8日16:45:30
 */
public interface IProcessG6Service extends IService<ProcessG6> {


    String getId(Integer id);

    IPage<ProcessG6> pageList(Page<ProcessG6> page, Map<String, Object> params);

    IPage<ProcessG6> pageListAdmin(Page<ProcessG6> page);
}
