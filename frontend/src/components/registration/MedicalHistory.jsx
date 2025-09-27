// src/components/registration/MedicalHistory.jsx
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Trash2, AlertTriangle, Activity, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import Button from '../common/Button';
import Input from '../common/Input';
import RegistrationLayout from './RegistrationLayout';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const { registerMedicalHistory, registrationData, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState('health-concerns');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: registrationData.medicalHistory || {
      currentHealthConcerns: [{ concern: '', severity: '', duration: '' }],
      currentMedications: [{ name: '', dosage: '', frequency: '', prescribedBy: '' }],
      previousSurgeries: [{ surgery: '', date: '', hospital: '', notes: '' }],
      recentHospitalizations: [{ reason: '', hospital: '', admissionDate: '', dischargeDate: '' }],
      chronicConditions: {},
      allergies: { food: '', drug: '', environmental: '', seasonal: '' },
      familyMedicalHistory: {},
      lifestyle: {
        smoking: { status: 'Never', details: '' },
        alcohol: { frequency: 'Never', amount: '' },
        exercise: [{ frequency: 'Never', type: '', duration: '' }],
        diet: { type: '', preferences: '', restrictions: '' },
        sleep: { averageHours: '', quality: '', issues: '' },
        stress: { level: '', managementTechniques: '' }
      },
      ayurvedicExperience: false
    }
  });

  const { fields: healthConcernFields, append: appendHealthConcern, remove: removeHealthConcern } = useFieldArray({
    control,
    name: 'currentHealthConcerns'
  });

  const { fields: medicationFields, append: appendMedication, remove: removeMedication } = useFieldArray({
    control,
    name: 'currentMedications'
  });

  const { fields: surgeryFields, append: appendSurgery, remove: removeSurgery } = useFieldArray({
    control,
    name: 'previousSurgeries'
  });

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: 'lifestyle.exercise'
  });

  // Helper to safely process form data
  const processFormData = (data) => {
    // Create a deep copy
    const processed = JSON.parse(JSON.stringify(data));

    // Add email from personal info
    const personalInfo = registrationData.personalInfo;
    processed.email = personalInfo?.email;

    // Process exercise data specifically
    if (processed.lifestyle?.exercise) {
      processed.lifestyle.exercise = processed.lifestyle.exercise
        .map(ex => ({
          frequency: ex.frequency || 'Never',
          type: typeof ex.type === 'string' ? 
            ex.type.split(',').map(t => t.trim()).filter(Boolean) : 
            (Array.isArray(ex.type) ? ex.type.filter(Boolean) : []),
          duration: ex.duration ? String(ex.duration).trim() : ''
        }))
        .filter(ex => ex.frequency !== 'Never' || ex.type.length > 0 || ex.duration !== '');
    }

    // Process other array fields
    const processStringToArray = (value) => {
      if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
      return Array.isArray(value) ? value.filter(Boolean) : [];
    };

    // Process allergies
    if (processed.allergies) {
      ['food', 'drug', 'environmental', 'seasonal'].forEach(type => {
        if (processed.allergies[type]) {
          processed.allergies[type] = processStringToArray(processed.allergies[type]);
        }
      });
    }

    // Process diet preferences and restrictions
    if (processed.lifestyle?.diet) {
      if (processed.lifestyle.diet.preferences) {
        processed.lifestyle.diet.preferences = processStringToArray(processed.lifestyle.diet.preferences);
      }
      if (processed.lifestyle.diet.restrictions) {
        processed.lifestyle.diet.restrictions = processStringToArray(processed.lifestyle.diet.restrictions);
      }
    }

    // Process sleep issues
    if (processed.lifestyle?.sleep?.issues) {
      processed.lifestyle.sleep.issues = processStringToArray(processed.lifestyle.sleep.issues);
    }

    // Process stress management techniques
    if (processed.lifestyle?.stress?.managementTechniques) {
      processed.lifestyle.stress.managementTechniques = processStringToArray(processed.lifestyle.stress.managementTechniques);
    }

    // Convert sleep hours to number
    if (processed.lifestyle?.sleep?.averageHours) {
      processed.lifestyle.sleep.averageHours = Number(processed.lifestyle.sleep.averageHours);
    }

    return processed;
  };

  const onSubmit = async (data) => {
    try {
      console.log('Raw form data:', data);
      
      const processedData = processFormData(data);
      
      console.log('Processed form data:', processedData);

      const result = await registerMedicalHistory(processedData);
      if (result?.success) {
        navigate('/register/dosha-assessment');
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const chronicConditionsList = [
    'diabetes', 'heartDisease', 'arthritis', 'kidneyDisease', 'cancer',
    'thyroidDisorder', 'hypertension', 'depression', 'anxiety'
  ];

  const allergyTypes = ['food', 'drug', 'environmental', 'seasonal'];

  const tabs = [
    { id: 'health-concerns', label: 'Health Concerns', icon: AlertTriangle },
    { id: 'conditions', label: 'Medical Conditions', icon: Heart },
    { id: 'lifestyle', label: 'Lifestyle', icon: Activity },
    { id: 'family-history', label: 'Family History', icon: Clock }
  ];

  const renderHealthConcerns = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Health Concerns</h3>
        {healthConcernFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
            <Input
              label="Health Concern"
              placeholder="e.g., Joint pain"
              {...register(`currentHealthConcerns.${index}.concern`)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                {...register(`currentHealthConcerns.${index}.severity`)}
              >
                <option value="">Select severity</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
              </select>
            </div>
            <Input
              label="Duration"
              placeholder="e.g., 6 months"
              {...register(`currentHealthConcerns.${index}.duration`)}
            />
            <div className="flex items-end">
              {healthConcernFields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeHealthConcern(index)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                />
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          icon={Plus}
          onClick={() => appendHealthConcern({ concern: '', severity: '', duration: '' })}
        >
          Add Another Concern
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Medications</h3>
        {medicationFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
            <Input
              label="Medication Name"
              placeholder="e.g., Aspirin"
              {...register(`currentMedications.${index}.name`)}
            />
            <Input
              label="Dosage"
              placeholder="e.g., 100mg"
              {...register(`currentMedications.${index}.dosage`)}
            />
            <Input
              label="Frequency"
              placeholder="e.g., Once daily"
              {...register(`currentMedications.${index}.frequency`)}
            />
            <Input
              label="Prescribed By"
              placeholder="Doctor name"
              {...register(`currentMedications.${index}.prescribedBy`)}
            />
            <div className="flex items-end">
              {medicationFields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeMedication(index)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                />
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          icon={Plus}
          onClick={() => appendMedication({ name: '', dosage: '', frequency: '', prescribedBy: '' })}
        >
          Add Medication
        </Button>
      </div>
    </div>
  );

  const renderConditions = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Chronic Conditions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chronicConditionsList.map((condition) => (
            <label key={condition} className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                {...register(`chronicConditions.${condition}`)}
              />
              <span className="text-sm text-gray-700 capitalize">
                {condition.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Allergies & Sensitivities</h3>
        {allergyTypes.map((type) => (
          <div key={type} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {type} Allergies (comma separated)
            </label>
            <Input
              placeholder={`Enter ${type} allergies separated by commas`}
              {...register(`allergies.${type}`)}
            />
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Surgeries</h3>
        {surgeryFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
            <Input
              label="Surgery"
              placeholder="Type of surgery"
              {...register(`previousSurgeries.${index}.surgery`)}
            />
            <Input
              label="Date"
              type="date"
              {...register(`previousSurgeries.${index}.date`)}
            />
            <Input
              label="Hospital"
              placeholder="Hospital name"
              {...register(`previousSurgeries.${index}.hospital`)}
            />
            <div className="flex items-end">
              {surgeryFields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeSurgery(index)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                />
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          icon={Plus}
          onClick={() => appendSurgery({ surgery: '', date: '', hospital: '', notes: '' })}
        >
          Add Surgery
        </Button>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            {...register('ayurvedicExperience')}
          />
          <span className="text-sm text-gray-700">
            I have previous experience with Ayurvedic treatments
          </span>
        </label>
      </div>
    </div>
  );

  const renderLifestyle = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Smoking</h4>
          <div className="space-y-2">
            {['Never', 'Former', 'Current', 'Occasional'].map((status) => (
              <label key={status} className="flex items-center space-x-3">
                <input
                  type="radio"
                  value={status}
                  className="text-green-600 focus:ring-green-500"
                  {...register('lifestyle.smoking.status')}
                />
                <span className="text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Alcohol Consumption</h4>
          <div className="space-y-2">
            {['Never', 'Rarely', 'Occasionally', 'Regularly', 'Daily'].map((frequency) => (
              <label key={frequency} className="flex items-center space-x-3">
                <input
                  type="radio"
                  value={frequency}
                  className="text-green-600 focus:ring-green-500"
                  {...register('lifestyle.alcohol.frequency')}
                />
                <span className="text-sm text-gray-700">{frequency}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Exercise Routines</h4>
        {exerciseFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                {...register(`lifestyle.exercise.${index}.frequency`)}
              >
                <option value="">Select frequency</option>
                <option value="Never">Never</option>
                <option value="1-2 times/week">1-2 times/week</option>
                <option value="3-4 times/week">3-4 times/week</option>
                <option value="5+ times/week">5+ times/week</option>
                <option value="Daily">Daily</option>
              </select>
            </div>
            <Input
              label="Duration per session"
              placeholder="e.g., 30 minutes"
              {...register(`lifestyle.exercise.${index}.duration`)}
            />
            <Input
              label="Types of exercise"
              placeholder="e.g., Walking, Yoga (comma separated)"
              {...register(`lifestyle.exercise.${index}.type`)}
            />
            <div className="flex items-end">
              {exerciseFields.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeExercise(index)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                />
              )}
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          icon={Plus}
          onClick={() => appendExercise({ frequency: '', type: '', duration: '' })}
        >
          Add Exercise Routine
        </Button>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Diet</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
              {...register('lifestyle.diet.type')}
            >
              <option value="">Select diet type</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-vegetarian">Non-vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Jain">Jain</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <Input
            label="Dietary Restrictions"
            placeholder="e.g., Gluten-free, Dairy-free (comma separated)"
            {...register('lifestyle.diet.restrictions')}
          />
        </div>
        <div className="mt-4">
          <Input
            label="Dietary Preferences"
            placeholder="e.g., Organic, Low-sodium (comma separated)"
            {...register('lifestyle.diet.preferences')}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Sleep</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Average hours per night"
            type="number"
            min="4"
            max="12"
            placeholder="e.g., 7"
            {...register('lifestyle.sleep.averageHours')}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Quality</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
              {...register('lifestyle.sleep.quality')}
            >
              <option value="">Select quality</option>
              <option value="Poor">Poor</option>
              <option value="Fair">Fair</option>
              <option value="Good">Good</option>
              <option value="Excellent">Excellent</option>
            </select>
          </div>
          <Input
            label="Sleep Issues"
            placeholder="e.g., Insomnia, Snoring (comma separated)"
            {...register('lifestyle.sleep.issues')}
          />
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Stress Level</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Stress Level</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
              {...register('lifestyle.stress.level')}
            >
              <option value="">Select level</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
              <option value="Very High">Very High</option>
            </select>
          </div>
          <Input
            label="Stress Management Techniques"
            placeholder="e.g., Meditation, Yoga (comma separated)"
            {...register('lifestyle.stress.managementTechniques')}
          />
        </div>
      </div>
    </div>
  );

  const renderFamilyHistory = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Family Medical History</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please check if any immediate family members (parents, siblings, grandparents) have had these conditions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['diabetes', 'heartDisease', 'cancer', 'hypertension', 'mentalHealth'].map((condition) => (
            <label key={condition} className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                {...register(`familyMedicalHistory.${condition}`)}
              />
              <span className="text-sm text-gray-700 capitalize">
                {condition.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Family History Notes
        </label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
          placeholder="Please provide any additional family medical history that might be relevant..."
          {...register('familyMedicalHistory.notes')}
        />
      </div>
    </div>
  );

  return (
    <RegistrationLayout currentStep="medical-history">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical History</h2>
          <p className="text-gray-600">Help us understand your health background</p>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="min-h-96">
            {activeTab === 'health-concerns' && renderHealthConcerns()}
            {activeTab === 'conditions' && renderConditions()}
            {activeTab === 'lifestyle' && renderLifestyle()}
            {activeTab === 'family-history' && renderFamilyHistory()}
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/register/personal-info')}
            >
              Back to Personal Info
            </Button>

            <div className="flex space-x-3">
              {activeTab !== 'family-history' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabOrder = ['health-concerns', 'conditions', 'lifestyle', 'family-history'];
                    const currentIndex = tabOrder.indexOf(activeTab);
                    if (currentIndex < tabOrder.length - 1) {
                      setActiveTab(tabOrder[currentIndex + 1]);
                    }
                  }}
                >
                  Next Section
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Continue to Dosha Assessment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </RegistrationLayout>
  );
};

export default MedicalHistory;      