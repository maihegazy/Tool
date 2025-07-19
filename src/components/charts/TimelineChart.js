'use client';


import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Users, BarChart3, ZoomIn, ZoomOut, Filter } from 'lucide-react';

const TimelineChart = ({ rfqs, utils, className = '' }) => {
  const [viewMode, setViewMode] = useState('gantt');
  const [timeScale, setTimeScale] = useState('months');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showResources, setShowResources] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Generate timeline data
  const timelineData = useMemo(() => {
    const filteredRfqs = rfqs.filter(rfq => {
      if (filterStatus === 'all') return true;
      return rfq.status === filterStatus;
    });

    // Calculate date range
    const allDates = [];
    filteredRfqs.forEach(rfq => {
      if (rfq.createdDate) allDates.push(new Date(rfq.createdDate));
      if (rfq.deadline) allDates.push(new Date(rfq.deadline));
    });

    const minDate = allDates.length > 0 ? new Date(Math.min(...allDates)) : new Date();
    const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates)) : new Date();

    // Generate time periods based on scale
    const periods = [];
    const current = new Date(minDate.getFullYear(), timeScale === 'months' ? minDate.getMonth() : 0, 1);
    const end = new Date(maxDate.getFullYear(), timeScale === 'months' ? maxDate.getMonth() : 11, 1);

    while (current <= end) {
      if (timeScale === 'months') {
        periods.push({
          key: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
          label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          start: new Date(current),
          end: new Date(current.getFullYear(), current.getMonth() + 1, 0)
        });
        current.setMonth(current.getMonth() + 1);
      } else {
        periods.push({
          key: current.getFullYear().toString(),
          label: current.getFullYear().toString(),
          start: new Date(current.getFullYear(), 0, 1),
          end: new Date(current.getFullYear(), 11, 31)
        });
        current.setFullYear(current.getFullYear() + 1);
      }
    }

    return { rfqs: filteredRfqs, periods, minDate, maxDate };
  }, [rfqs, timeScale, filterStatus]);

  // Calculate position and width for timeline bars
  const calculateBarPosition = (startDate, endDate, minDate, maxDate) => {
    const totalDuration = maxDate.getTime() - minDate.getTime();
    const startOffset = new Date(startDate).getTime() - minDate.getTime();
    const duration = new Date(endDate).getTime() - new Date(startDate).getTime();

    const left = (startOffset / totalDuration) * 100;
    const width = (duration / totalDuration) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.max(1, width)}%` };
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-blue-500',
      'In Progress': 'bg-yellow-500',
      'Review': 'bg-purple-500',
      'Approved': 'bg-green-500',
      'On Hold': 'bg-gray-500',
      'Cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  // Gantt Chart View
  const GanttChart = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="p-4 border-b">
        <h4 className="font-medium text-gray-800">Project Timeline - Gantt View</h4>
      </div>
      
      {/* Timeline Header */}
      <div className="border-b bg-gray-50">
        <div className="flex">
          <div className="w-80 p-3 font-medium text-gray-700 border-r">Project</div>
          <div className="flex-1 relative">
            <div className="flex">
              {timelineData.periods.map(period => (
                <div
                  key={period.key}
                  className="flex-1 p-3 text-center text-sm font-medium text-gray-700 border-r"
                  style={{ minWidth: timeScale === 'months' ? '80px' : '120px' }}
                >
                  {period.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Body */}
      <div className="max-h-96 overflow-y-auto">
        {timelineData.rfqs.map(rfq => {
          const barPosition = calculateBarPosition(
            rfq.createdDate,
            rfq.deadline,
            timelineData.minDate,
            timelineData.maxDate
          );

          return (
            <div key={rfq.id} className="flex border-b hover:bg-gray-50">
              <div className="w-80 p-3 border-r">
                <div className="font-medium text-sm truncate" title={rfq.name}>
                  {rfq.name}
                </div>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(rfq.status)}`}>
                    {rfq.status}
                  </span>
                  {showResources && (
                    <span className="text-xs text-gray-500">
                      {utils.getUniquePersons(rfq).length} resources
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 relative p-3">
                <div className="relative h-6">
                  <div
                    className={`absolute h-4 rounded ${getStatusColor(rfq.status)} opacity-80 flex items-center justify-center`}
                    style={barPosition}
                  >
                    <span className="text-xs text-white font-medium truncate px-2">
                      {Math.round(utils.calculateTotalHours(rfq))}h
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Calendar View
  const CalendarView = () => {
    const currentMonth = new Date(selectedYear, new Date().getMonth(), 1);
    const daysInMonth = new Date(selectedYear, currentMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(selectedYear, currentMonth.getMonth(), 1).getDay();

    const getDayEvents = (day) => {
      const date = new Date(selectedYear, currentMonth.getMonth(), day);
      return timelineData.rfqs.filter(rfq => {
        const start = new Date(rfq.createdDate);
        const end = new Date(rfq.deadline);
        return date >= start && date <= end;
      });
    };

    return (
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-medium text-gray-800">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedYear(selectedYear - 1)}
              className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              ←
            </button>
            <button
              onClick={() => setSelectedYear(selectedYear + 1)}
              className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-r">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="h-24 border-r border-b bg-gray-50"></div>
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const events = getDayEvents(day);
            
            return (
              <div key={day} className="h-24 border-r border-b p-1 overflow-hidden">
                <div className="text-sm font-medium text-gray-700 mb-1">{day}</div>
                <div className="space-y-1">
                  {events.slice(0, 2).map(rfq => (
                    <div
                      key={rfq.id}
                      className={`text-xs p-1 rounded truncate text-white ${getStatusColor(rfq.status)}`}
                      title={rfq.name}
                    >
                      {rfq.name.substring(0, 15)}...
                    </div>
                  ))}
                  {events.length > 2 && (
                    <div className="text-xs text-gray-500">+{events.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Resource Timeline
  const ResourceTimeline = () => {
    const allPersons = new Set();
    timelineData.rfqs.forEach(rfq => {
      utils.getUniquePersons(rfq).forEach(person => allPersons.add(person));
    });

    return (
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h4 className="font-medium text-gray-800">Resource Timeline</h4>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {Array.from(allPersons).map(person => {
            const personRfqs = timelineData.rfqs.filter(rfq => 
              utils.getUniquePersons(rfq).includes(person)
            );

            return (
              <div key={person} className="flex border-b">
                <div className="w-48 p-3 border-r bg-gray-50">
                  <div className="font-medium text-sm">{person}</div>
                  <div className="text-xs text-gray-500">
                    {personRfqs.length} project{personRfqs.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex-1 relative p-3">
                  <div className="relative h-8">
                    {personRfqs.map((rfq, index) => {
                      const barPosition = calculateBarPosition(
                        rfq.createdDate,
                        rfq.deadline,
                        timelineData.minDate,
                        timelineData.maxDate
                      );

                      return (
                        <div
                          key={rfq.id}
                          className={`absolute h-3 rounded ${getStatusColor(rfq.status)} opacity-70`}
                          style={{
                            ...barPosition,
                            top: `${index * 14}px`
                          }}
                          title={rfq.name}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Calendar className="mr-2" size={20} />
              Timeline View
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'gantt' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Gantt
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setViewMode('resources')}
                className={`px-3 py-1 rounded text-sm ${
                  viewMode === 'resources' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Resources
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-500" />
              <select
                value={timeScale}
                onChange={(e) => setTimeScale(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="months">Monthly</option>
                <option value="years">Yearly</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Approved">Approved</option>
                <option value="On Hold">On Hold</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showResources}
                onChange={(e) => setShowResources(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Resources</span>
            </label>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      {viewMode === 'gantt' && <GanttChart />}
      {viewMode === 'calendar' && <CalendarView />}
      {viewMode === 'resources' && <ResourceTimeline />}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-blue-600">
            {timelineData.rfqs.length}
          </div>
          <div className="text-sm text-gray-600">Active Projects</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-green-600">
            {timelineData.rfqs.filter(rfq => rfq.status === 'In Progress').length}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {timelineData.rfqs.filter(rfq => new Date(rfq.deadline) < new Date()).length}
          </div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-purple-600">
            {timelineData.periods.length}
          </div>
          <div className="text-sm text-gray-600">Time Periods</div>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;