const Department = require('../models/Department');
const { validationResult } = require('express-validator');

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ 
      error: 'Failed to fetch departments',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code } = req.body;
    console.log('Creating department:', { name, code });

    // Check if department with same code already exists
    const existingDepartment = await Department.findOne({ code });
    if (existingDepartment) {
      return res.status(400).json({ error: 'Department with this code already exists' });
    }

    const department = new Department({
      name,
      code
    });

    await department.save();
    console.log('Department created successfully:', department);

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ 
      error: 'Failed to create department',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};