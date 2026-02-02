import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { TABLE_NAMES } from '@/lib/constants';

// Mock data - for testing purposes
const allFeedback = [
  { id: 1, studentId: '1', content: 'Great job on the last assignment! Your analysis was spot on.', read: true, createdAt: '2024-05-10T10:00:00Z' },
  { id: 2, studentId: '1', content: 'Remember to check the formatting guidelines for the next report.', read: false, createdAt: '2024-05-12T14:30:00Z' },
  { id: 3, studentId: '2', content: 'Your presentation skills are improving.', read: true, createdAt: '2024-05-11T11:00:00Z' },
  { id: 4, studentId: '1', content: 'I noticed a small error in your code submission for project "Orion". Please review line 42.', read: false, createdAt: '2024-05-13T09:00:00Z' },
];

// In-memory store to track read status for the mock.
let feedbackStore = [...allFeedback];

export async function GET(request: Request) {
  // If USE_MOCK_DATA is true, use the mock data
  if (process.env.USE_MOCK_DATA === 'true') {
    const studentId = '1'; // Mocking studentId
    const userFeedback = feedbackStore.filter(f => f.studentId === studentId);
    return NextResponse.json(userFeedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  const session = await getSession();
  if (!session?.user?.name) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient();
  const githubUsername = session.user.name;

  // 1. Get student id from github_username
  const { data: studentData, error: studentError } = await supabase
    .from(TABLE_NAMES.STUDENTS)
    .select('id')
    .eq('github_username', githubUsername)
    .single();

  if (studentError || !studentData) {
    console.error('Error fetching student:', studentError);
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const studentId = studentData.id;

  // 2. Fetch feedback from both tables
  const { data: reviewersData, error: reviewersError } = await supabase
    .from(TABLE_NAMES.STUDENT_REVIEWERS)
    .select('*')
    .eq('student_id', studentId);

  const { data: commentsData, error: commentsError } = await supabase
    .from(TABLE_NAMES.REVIEW_COMMENTS)
    .select('*')
    .eq('student_username', githubUsername);

  if (reviewersError || commentsError) {
    console.error('Error fetching feedback:', reviewersError || commentsError);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }

  // 3. Map and combine feedback
  const reviewersFeedback = reviewersData?.map(item => ({
    id: `reviewer-${item.id}`,
    studentId: studentId,
    content: item.feedback_for_student,
    read: item.status === 'completed',
    createdAt: item.completed_at || item.created_at,
  })) || [];

  const commentsFeedback = commentsData?.map(item => ({
    id: `comment-${item.id}`,
    studentId: studentId,
    content: item.comment,
    read: false, // As per discussion, no 'read' status in zzz_review_comments
    createdAt: item.created_at,
  })) || [];

  const combinedFeedback = [...reviewersFeedback, ...commentsFeedback];

  // 4. Sort and return
  const sortedFeedback = combinedFeedback.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(sortedFeedback);
}

export async function POST(request: Request) {
    // If USE_MOCK_DATA is true, use the mock logic
    if (process.env.USE_MOCK_DATA === 'true') {
        const { feedbackId } = await request.json();
        if (!feedbackId) {
            return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
        }
        const feedbackIndex = feedbackStore.findIndex(f => f.id === feedbackId);
        if (feedbackIndex === -1) {
            return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
        }
        feedbackStore[feedbackIndex].read = true;
        return NextResponse.json({ success: true, updatedFeedback: feedbackStore[feedbackIndex] });
    }

    // For real data, as 'read' column doesn't exist, we just return success
    // The frontend will optimistically update the UI.
    const { feedbackId } = await request.json();
    if (!feedbackId) {
        return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }
    
    // In a real scenario with a 'read' column, you would update the database here.
    // e.g., await supabase.from('feedback').update({ read: true }).eq('id', feedbackId);

    return NextResponse.json({ success: true });
}
