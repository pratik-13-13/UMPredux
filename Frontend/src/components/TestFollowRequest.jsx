import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFollowRequests } from '../Store/Slices/followSlice';

const TestFollowRequest = () => {
  const dispatch = useDispatch();
  const { followRequests } = useSelector(state => state.follow);
  
  useEffect(() => {
    dispatch(getFollowRequests());
  }, [dispatch]);
  
  return (
    <div className="p-4 border border-gray-300 m-4">
      <h3>Follow Requests Debug:</h3>
      <p>Requests count: {followRequests?.length || 0}</p>
      <pre>{JSON.stringify(followRequests, null, 2)}</pre>
    </div>
  );
};

export default TestFollowRequest;
