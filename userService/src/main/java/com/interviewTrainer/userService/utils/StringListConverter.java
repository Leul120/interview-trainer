package com.interviewTrainer.userService.utils;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Convert;

import java.util.Arrays;
import java.util.List;

@Convert
public class StringListConverter implements AttributeConverter<List<String>,String> {
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        return attribute != null ? String.join(",", attribute) : null;
    }

    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        return dbData != null ? Arrays.asList(dbData.split(",")) : null;
    }
}
