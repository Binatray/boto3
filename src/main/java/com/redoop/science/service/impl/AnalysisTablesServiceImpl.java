
package com.redoop.science.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.redoop.science.entity.AnalysisTables;
import com.redoop.science.mapper.AnalysisTablesMapper;
import com.redoop.science.service.IAnalysisTablesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author admin
 * @since 2018-09-26
 */
@Service
public class AnalysisTablesServiceImpl extends ServiceImpl<AnalysisTablesMapper, AnalysisTables> implements IAnalysisTablesService {


    @Autowired
    AnalysisTablesMapper analysisTablesMapper;


}