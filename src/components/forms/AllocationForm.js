import React, { useState, useEffect } from 'react';
import { Save, X, Users, Calendar, AlertCircle, Plus } from 'lucide-react';

const AllocationForm = ({ 
  allocation, 
  rfq, 
  onSave, 
  onCancel, 
  mode = 'create',
  engineerRates = {},
  utils 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    level: 'Standard',
    location: 'HCC',
    role: 'Software Developer',
    feature: 'Integration',
    customFeature: '',
    allocationType: 'Whole Project',
    ftePercentage: 100,
    startDate: rfq?.createdDate || '',
    endDate: rfq?.deadline || '',
    monthlyFTE: {},
    skills: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedHours, setCalculatedHours] = useState(0);
  const [calculatedCost, setCalculatedCost] = useState(0);

  const engineerLevels = ['Junior', 'Standard', 'Senior', 'Principal', 'Technical Leader', 'FO'];
  const locations = ['HCC', 'BCC', 'MCC'];
  const roles = [
    'Project Manager', 'Defect Manager', 'Technical Lead', 'Test Lead',
    'Architect', 'BSW SW Architect', 'FO', 'Integration Lead', 'Integration',
    'Integrator', 'Software Developer', 'Software Test Engineer (UT, IT)',
    'Software Test Engineer (QT)'
  ];
  const features = [
    'Diagnostics & Degradation', 'Log & Trace', 'Flashing & Coding', 'Life Cycle',
    'Cluster (MCAL, OS)', 'FUSA', 'Cyber Security', 'Network', 'Integration',
    'Architecture', 'Project Management', 'Resident Engineer', 'Other'
  ];
  const ftePercentages = [25, 50, 75, 100];

  useEffect(() => {
    if (mode === 'edit' && allocation) {
      setFormData({
        name: allocation.name || '',
        level: allocation.level || 'Standard',
        location: allocation.location || 'HCC',
        role: allocation.role || 'Software Developer',
        feature: allocation.feature || 'Integration',
        customFeature: allocation.customFeature || '',
        allocationType: allocation.allocationType || 'Whole Project',
        ftePercentage: allocation.ftePercentage || 100,
        startDate: allocation.startDate || rfq?.createdDate || '',
        endDate: allocation.endDate || rfq?.deadline || '',
        monthlyFTE: allocation.monthlyFTE || {},
        skills: allocation.skills || [],
        notes: allocation.notes || ''
      });
    }
  }, [allocation, mode, rfq]);

  // Calculate hours and cost whenever form data changes
  useEffect(() => {
    if (utils && formData.startDate && formData.endDate) {
      const mockAllocation = {
        ...formData,
        id: allocation?.id || Date.now()
      };
      
      const hours = utils.calculateAllocationHours(mockAllocation);
      setCalculatedHours(hours);

      if (engineerRates[formData.level] && engineerRates[formData.level][formData.location]) {
        const rate = engineerRates[formData.level][formData.location];
        setCalculatedCost(hours * rate);
      }
    }
  }, [formData, utils, engineerRates, allocation]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Engineer name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.feature === 'Other' && !formData.customFeature.trim()) {
      newErrors.customFeature = 'Please specify the custom feature';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const allocationData = {
        ...formData,
        id: mode === 'edit' ? allocation.id : Date.now()
      };

      // If allocation type is "Whole Project", update dates to match RFQ
      if (formData.allocationType === 'Whole Project') {
        allocationData.startDate = rfq.createdDate;
        allocationData.endDate = rfq.deadline;
      }

      await onSave(allocationData);
    } catch (error) {
      console.error('Error saving allocation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSkill = (skill) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const getCurrentRate = () => {
    if (engineerRates[formData.level] && engineerRates[formData.level][formData.location]) {
      return engineerRates[formData.level][formData.location];
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Users className="mr-2 text-blue-600" size={24} />
          <h2 className="text-xl font-semibold">
            {mode === 'edit' ? 'Edit Resource Allocation' : 'Add Resource Allocation'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Engineer Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Engineer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engineer Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter engineer name"
              />
              {errors.name && (
                <div className="flex items-center mt-1 text-red-600 text-sm">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {engineerLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Allocation Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Allocation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feature
              </label>
              <select
                value={formData.feature}
                onChange={(e) => handleInputChange('feature', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {features.map(feature => (
                  <option key={feature} value={feature}>{feature}</option>
                ))}
              </select>
            </div>

            {formData.feature === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Feature *
                </label>
                <input
                  type="text"
                  value={formData.customFeature}
                  onChange={(e) => handleInputChange('customFeature', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.customFeature ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Specify custom feature"
                />
                {errors.customFeature && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.customFeature}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allocation Type
              </label>
              <select
                value={formData.allocationType}
                onChange={(e) => handleInputChange('allocationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Whole Project">Whole Project</option>
                <option value="Specific Period">Specific Period</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                FTE Percentage
              </label>
              <select
                value={formData.ftePercentage}
                onChange={(e) => handleInputChange('ftePercentage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ftePercentages.map(percentage => (
                  <option key={percentage} value={percentage}>{percentage}%</option>
                ))}
              </select>
            </div>

            {formData.allocationType === 'Specific Period' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
                  </div>
                  {errors.startDate && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.startDate}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
                  </div>
                  {errors.endDate && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.endDate}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Required Skills
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add skills (press Enter to add)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(e.target.value);
                e.target.value = '';
              }
            }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Additional notes or requirements for this allocation..."
          />
        </div>

        {/* Calculation Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Allocation Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Total Hours</div>
              <div className="font-semibold text-blue-600">{calculatedHours}h</div>
            </div>
            <div>
              <div className="text-gray-600">Hourly Rate</div>
              <div className="font-semibold text-blue-600">€{getCurrentRate()}/h</div>
            </div>
            <div>
              <div className="text-gray-600">Total Cost</div>
              <div className="font-semibold text-blue-600">€{calculatedCost.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600">FTE</div>
              <div className="font-semibold text-blue-600">{formData.ftePercentage}%</div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                {mode === 'edit' ? 'Update Allocation' : 'Add Allocation'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AllocationForm;