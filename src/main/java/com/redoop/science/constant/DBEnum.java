
package com.redoop.science.constant;

/**
 * @Author: Alan
 * @Time: 2018/9/18 10:55
 * @Description: 数据库类型
 */
public enum  DBEnum {
    MYSQL(1,"mysql"),
    ORACLE(2,"oracle"),
    PG(3,"pg"),
    SQLSERVER(4,"sqlserver"),
    HIVE(5,"hive"),
    REDIS(6,"redis"),
    KAFKA(7,"kafka"),
    L(8,"L-SQL");



    private Integer dbType;
    private String name;

    DBEnum(Integer dbType,String name) {
        this.dbType = dbType;
        this.name = name;
    }

    public Integer getDbType() {
        return dbType;
    }

    public String getName() {
        return name;
    }



    /**
     * 菜单类型
     */
    public enum MenuType {
        /**
         * 目录
         */
        CATALOG(0),
        /**
         * 菜单
         */
        MENU(1),
        /**
         * 按钮
         */
        BUTTON(2);

        private int value;

        MenuType(int value) {
            this.value = value;
        }

        public int getValue() {
            return value;
        }
    }
}