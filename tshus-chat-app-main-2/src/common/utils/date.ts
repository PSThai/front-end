import moment from 'moment';

export const formatToTime = (dateString: string): string => {
  // Check is valid
  if (!dateString) return '';
  
  // Original
  const originalDateTime = moment(dateString);

  // Format to AM or PM
  const formattedTime = originalDateTime.format('h:mm a');

  // Return
  return formattedTime.toUpperCase();
};

export const formatToDateTime = (dateString: string): string => {
  // Check is valid
  if (!dateString) return '';
  
  // Original
  const originalDateTime = moment(dateString);

  // Format to AM or PM
  const formattedTime = originalDateTime.format('DD/MM/YYYY');

  // Return
  return formattedTime.toUpperCase();
};
