package com.redoop.science.dto;

import com.redoop.science.entity.RealDb;
import com.redoop.science.entity.RealDbTables;
import lombok.Data;

import java.util.List;

/**
 * @Author: Alan
 * @Time: 2018/9/18 16:21
 * @Description:
 */
@Data
public class RealDbDto extends RealDb {
    private List<RealDbTables> realDbTables;
}
