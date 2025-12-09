import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import {
  X,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  MessageSquare,
  Paperclip,
  AlertCircle,
  Send,
  Plus,
  Edit2,
} from 'lucide-react';
import { TaskEnhanced, Subtask, ChecklistItem, Comment } from '../lib/data/tasks-enhanced';
import { 
  teamMembers, 
  getTeamMemberByCode, 
  getInitials, 
  getAvatarColor,
  parseMentions,
  formatMention,
  createEmailAlert 
} from '../lib/data/team-data';

interface TaskDetailViewProps {
  task: TaskEnhanced;
  onClose: () => void;
  onUpdate?: (task: TaskEnhanced) => void;
}

const COLORS = {
  primary: '#D97706',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#0EA5E9',
};

export default function TaskDetailView({ task, onClose, onUpdate }: TaskDetailViewProps) {
  const [commentText, setCommentText] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState<string | null>(null);

  const owner = getTeamMemberByCode(task.owner);
  const assignee = task.assignee ? getTeamMemberByCode(task.assignee) : null;

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;

    const mentions = parseMentions(commentText);
    const newComment: Comment = {
      id: `COM-${Date.now()}`,
      author: 'CKVC', // Current user - would come from auth
      text: commentText,
      mentions,
      createdAt: new Date().toISOString(),
    };

    // Send email alerts to mentioned users
    mentions.forEach((memberCode) => {
      const member = getTeamMemberByCode(memberCode);
      if (member?.notificationPreferences?.mentions) {
        const alert = createEmailAlert(
          'mentioned',
          memberCode,
          `You were mentioned in ${task.name}`,
          `@${getTeamMemberByCode('CKVC')?.name} mentioned you: ${commentText}`,
          task.id,
          task.name,
          'CKVC'
        );
        console.log('Email alert would be sent:', alert);
      }
    });

    // Update task with new comment
    const updatedTask = {
      ...task,
      comments: [...task.comments, newComment],
    };

    if (onUpdate) onUpdate(updatedTask);
    setCommentText('');
    setShowMentionMenu(false);
  };

  const handleChecklistToggle = (subtaskId: string, checklistItemId: string) => {
    const updatedTask = { ...task };
    const subtask = updatedTask.subtasks?.find((st) => st.id === subtaskId);
    if (!subtask) return;

    const item = subtask.checklist.find((ci) => ci.id === checklistItemId);
    if (!item) return;

    item.completed = !item.completed;
    if (item.completed) {
      item.completedBy = 'CKVC'; // Current user
      item.completedAt = new Date().toISOString();
    } else {
      item.completedBy = undefined;
      item.completedAt = undefined;
    }

    // Update subtask progress
    const completedCount = subtask.checklist.filter((ci) => ci.completed).length;
    subtask.progress = Math.round((completedCount / subtask.checklist.length) * 100);

    // Check if subtask is fully complete
    if (subtask.progress === 100 && subtask.status !== 'completed') {
      subtask.status = 'completed';
      
      // Send completion alert
      if (subtask.assignee) {
        const alert = createEmailAlert(
          'checklist_completed',
          subtask.assignee,
          `Subtask completed: ${subtask.name}`,
          `All checklist items completed in ${task.name}`,
          task.id,
          task.name,
          'CKVC'
        );
        console.log('Completion alert would be sent:', alert);
      }
    }

    // Update task progress based on subtasks
    if (updatedTask.subtasks && updatedTask.subtasks.length > 0) {
      const totalProgress = updatedTask.subtasks.reduce((sum, st) => sum + st.progress, 0);
      updatedTask.progress = Math.round(totalProgress / updatedTask.subtasks.length);
    }

    if (onUpdate) onUpdate(updatedTask);
  };

  const handleMentionInsert = (memberCode: string) => {
    const cursorPos = commentText.length;
    const beforeCursor = commentText.substring(0, cursorPos);
    const afterCursor = commentText.substring(cursorPos);
    
    // Find the last @ symbol
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const newText = 
      beforeCursor.substring(0, lastAtIndex) + 
      `@${memberCode} ` + 
      afterCursor;
    
    setCommentText(newText);
    setShowMentionMenu(false);
    setMentionFilter('');
  };

  const handleCommentChange = (text: string) => {
    setCommentText(text);
    
    // Detect @ mention trigger
    const cursorPos = text.length;
    const beforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const afterAt = beforeCursor.substring(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setShowMentionMenu(true);
        setMentionFilter(afterAt);
      } else {
        setShowMentionMenu(false);
      }
    } else {
      setShowMentionMenu(false);
    }
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      mentionFilter === '' ||
      member.code.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      member.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: COLORS.danger,
      high: COLORS.warning,
      medium: COLORS.info,
      low: '#6B7280',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: COLORS.success,
      in_progress: COLORS.info,
      blocked: COLORS.warning,
      at_risk: COLORS.danger,
      on_hold: '#6B7280',
      not_started: '#6B7280',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-slate-500">{task.code}</span>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: `${getPriorityColor(task.priority)}20`,
                  color: getPriorityColor(task.priority),
                }}
              >
                {task.priority.toUpperCase()}
              </Badge>
              <Badge
                variant="secondary"
                style={{
                  backgroundColor: `${getStatusColor(task.status)}20`,
                  color: getStatusColor(task.status),
                }}
              >
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <h2 className="text-2xl font-semibold mb-2">{task.name}</h2>
            {task.description && (
              <p className="text-slate-600 text-sm">{task.description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="col-span-2 space-y-6">
              {/* Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Progress value={task.progress} className="flex-1" />
                    <span className="text-sm font-semibold">{task.progress}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Subtasks & Checklists */}
              {task.subtasks && task.subtasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Subtasks & Checklists</CardTitle>
                    <CardDescription>Track detailed work items</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-medium mb-1">{subtask.name}</div>
                            {subtask.description && (
                              <div className="text-sm text-slate-600 mb-2">
                                {subtask.description}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              {subtask.assignee && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{getTeamMemberByCode(subtask.assignee)?.name}</span>
                                </div>
                              )}
                              {subtask.dueDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{subtask.dueDate}</span>
                                </div>
                              )}
                              {subtask.estimatedHours && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{subtask.estimatedHours}h est</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${getStatusColor(subtask.status)}20`,
                              color: getStatusColor(subtask.status),
                            }}
                          >
                            {subtask.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <Progress value={subtask.progress} className="h-2" />
                        </div>

                        {/* Checklist */}
                        <div className="space-y-2">
                          {subtask.checklist.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-2 p-2 hover:bg-slate-50 rounded"
                            >
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() =>
                                  handleChecklistToggle(subtask.id, item.id)
                                }
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <div
                                  className={`text-sm ${
                                    item.completed
                                      ? 'line-through text-slate-500'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {item.text}
                                </div>
                                {item.completed && item.completedBy && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    Completed by {getTeamMemberByCode(item.completedBy)?.name} •{' '}
                                    {new Date(item.completedAt!).toLocaleString()}
                                  </div>
                                )}
                                {item.assignee && !item.completed && (
                                  <div className="text-xs text-slate-500 mt-1">
                                    Assigned to {getTeamMemberByCode(item.assignee)?.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Comments</CardTitle>
                  <CardDescription>Discussion and @mentions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comment List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {task.comments.length === 0 ? (
                      <div className="text-center text-sm text-slate-500 py-8">
                        No comments yet. Start the conversation!
                      </div>
                    ) : (
                      task.comments.map((comment) => {
                        const author = getTeamMemberByCode(comment.author);
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar
                              className="h-8 w-8"
                              style={{ backgroundColor: getAvatarColor(comment.author) }}
                            >
                              <AvatarFallback className="text-xs text-white">
                                {author ? getInitials(author.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {author?.name || 'Unknown'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                {comment.text}
                              </div>
                              {comment.mentions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {comment.mentions.map((code) => (
                                    <Badge key={code} variant="outline" className="text-xs">
                                      {formatMention(code)}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="border-t pt-4 relative">
                    <Textarea
                      placeholder="Add a comment... Type @ to mention someone"
                      value={commentText}
                      onChange={(e) => handleCommentChange(e.target.value)}
                      rows={3}
                      className="mb-2"
                    />
                    
                    {/* Mention Menu */}
                    {showMentionMenu && (
                      <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                        {filteredMembers.length === 0 ? (
                          <div className="p-3 text-sm text-slate-500">No members found</div>
                        ) : (
                          filteredMembers.map((member) => (
                            <button
                              key={member.code}
                              onClick={() => handleMentionInsert(member.code)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 text-left"
                            >
                              <Avatar
                                className="h-8 w-8"
                                style={{ backgroundColor: getAvatarColor(member.code) }}
                              >
                                <AvatarFallback className="text-xs text-white">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{member.name}</div>
                                <div className="text-xs text-slate-500">
                                  @{member.code} • {member.email}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-slate-500">
                        Tip: Type @ to mention team members
                      </div>
                      <Button
                        onClick={handleCommentSubmit}
                        disabled={!commentText.trim()}
                        style={{ backgroundColor: COLORS.primary }}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Owner</div>
                    <div className="flex items-center gap-2">
                      <Avatar
                        className="h-6 w-6"
                        style={{ backgroundColor: getAvatarColor(task.owner) }}
                      >
                        <AvatarFallback className="text-xs text-white">
                          {owner ? getInitials(owner.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{owner?.name}</span>
                    </div>
                  </div>

                  {assignee && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Assignee</div>
                      <div className="flex items-center gap-2">
                        <Avatar
                          className="h-6 w-6"
                          style={{ backgroundColor: getAvatarColor(task.assignee!) }}
                        >
                          <AvatarFallback className="text-xs text-white">
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee.name}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Start Date</div>
                    <div className="text-sm">{task.startDate}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-1">Due Date</div>
                    <div className="text-sm">{task.endDate}</div>
                  </div>

                  {task.budgetHours && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Time Budget</div>
                      <div className="text-sm">
                        {task.actualHours || 0}h / {task.budgetHours}h
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RACI */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">RACI Matrix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-700 mb-1">Responsible</div>
                    <div className="flex flex-wrap gap-1">
                      {task.raci.responsible.map((code) => (
                        <Badge key={code} variant="outline">
                          {getTeamMemberByCode(code)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 mb-1">Accountable</div>
                    <div className="flex flex-wrap gap-1">
                      {task.raci.accountable.map((code) => (
                        <Badge key={code} variant="outline">
                          {getTeamMemberByCode(code)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 mb-1">Consulted</div>
                    <div className="flex flex-wrap gap-1">
                      {task.raci.consulted.map((code) => (
                        <Badge key={code} variant="outline">
                          {getTeamMemberByCode(code)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700 mb-1">Informed</div>
                    <div className="flex flex-wrap gap-1">
                      {task.raci.informed.map((code) => (
                        <Badge key={code} variant="outline">
                          {getTeamMemberByCode(code)?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
