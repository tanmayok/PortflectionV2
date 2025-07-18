import React, { useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Calendar as CalendarIcon,
  Star,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  profileImage: z.string().url('Invalid image URL').optional().or(z.literal(''))
});

const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiencyLevel: z.number().min(1).max(5),
  yearsExperience: z.number().optional(),
  certified: z.boolean().default(false)
});

const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  liveUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  images: z.array(z.string().url()).optional(),
  category: z.string().optional(),
  status: z.enum(['completed', 'in-progress', 'planned']).default('completed'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  featured: z.boolean().default(false)
});

const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional()
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional()
});

// Form component types
type ProfileFormData = z.infer<typeof profileSchema>;
type SkillFormData = z.infer<typeof skillSchema>;
type ProjectFormData = z.infer<typeof projectSchema>;
type ExperienceFormData = z.infer<typeof experienceSchema>;
type EducationFormData = z.infer<typeof educationSchema>;

// Skill categories
const SKILL_CATEGORIES = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'DevOps & Cloud',
  'Design & UX',
  'Data Science',
  'Project Management',
  'Soft Skills'
];

// Project categories
const PROJECT_CATEGORIES = [
  'Web Application',
  'Mobile App',
  'Desktop Application',
  'API/Backend',
  'Library/Framework',
  'Data Science',
  'Machine Learning',
  'Other'
];

// File upload component
const FileUpload: React.FC<{
  onUpload: (url: string) => void;
  accept?: string;
  className?: string;
}> = ({ onUpload, accept = "image/*", className }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Simulate file upload - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockUrl = `https://images.unsplash.com/photo-${Date.now()}`;
      onUpload(mockUrl);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
      />
      <Button
        variant="outline"
        disabled={uploading}
        className="w-full h-32 border-dashed border-2 flex flex-col items-center justify-center gap-2"
      >
        <Upload className="w-6 h-6" />
        <span>{uploading ? 'Uploading...' : 'Click to upload'}</span>
      </Button>
    </div>
  );
};

// Profile Information Form
const ProfileForm: React.FC<{
  onSubmit: (data: ProfileFormData) => void;
  defaultValues?: Partial<ProfileFormData>;
}> = ({ onSubmit, defaultValues }) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      profileImage: '',
      ...defaultValues
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              {form.watch('profileImage') && (
                <img
                  src={form.watch('profileImage')}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <FileUpload
                onUpload={(url) => form.setValue('profileImage', url)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="John Doe"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Professional Title *</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Full Stack Developer"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              {...form.register('bio')}
              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              className="min-h-24"
            />
            {form.formState.errors.bio && (
              <p className="text-sm text-destructive">{form.formState.errors.bio.message}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="john@example.com"
                  className="pl-10"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  {...form.register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="location"
                {...form.register('location')}
                placeholder="San Francisco, CA"
                className="pl-10"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-medium">Social Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="website"
                    {...form.register('website')}
                    placeholder="https://johndoe.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    {...form.register('linkedin')}
                    placeholder="https://linkedin.com/in/johndoe"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="github"
                    {...form.register('github')}
                    placeholder="https://github.com/johndoe"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Profile Information
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Skills Management Form
const SkillsForm: React.FC<{
  onSubmit: (data: SkillFormData[]) => void;
  defaultValues?: SkillFormData[];
}> = ({ onSubmit, defaultValues = [] }) => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: { skills: defaultValues }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills'
  });

  const addSkill = () => {
    append({
      name: '',
      category: '',
      proficiencyLevel: 3,
      yearsExperience: 0,
      certified: false
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Skills & Expertise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.skills))} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium">Skill #{index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skill Name *</Label>
                    <Controller
                      control={control}
                      name={`skills.${index}.name`}
                      rules={{ required: 'Skill name is required' }}
                      render={({ field, fieldState }) => (
                        <>
                          <Input {...field} placeholder="React, Python, Leadership..." />
                          {fieldState.error && (
                            <p className="text-sm text-destructive">{fieldState.error.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Controller
                      control={control}
                      name={`skills.${index}.category`}
                      rules={{ required: 'Category is required' }}
                      render={({ field, fieldState }) => (
                        <>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {SKILL_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.error && (
                            <p className="text-sm text-destructive">{fieldState.error.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Proficiency Level</Label>
                    <Controller
                      control={control}
                      name={`skills.${index}.proficiencyLevel`}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <Button
                                key={level}
                                type="button"
                                variant={field.value >= level ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => field.onChange(level)}
                                className="w-8 h-8 p-0"
                              >
                                {level}
                              </Button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {field.value === 1 && 'Beginner'}
                            {field.value === 2 && 'Basic'}
                            {field.value === 3 && 'Intermediate'}
                            {field.value === 4 && 'Advanced'}
                            {field.value === 5 && 'Expert'}
                          </p>
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Controller
                      control={control}
                      name={`skills.${index}.yearsExperience`}
                      render={({ field }) => (
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Controller
                    control={control}
                    name={`skills.${index}.certified`}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label>Certified</Label>
                      </div>
                    )}
                  />
                </div>
              </Card>
            ))}
          </div>

          <Button type="button" onClick={addSkill} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>

          <Button type="submit" className="w-full">
            Save Skills
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Projects Form Component
const ProjectsForm: React.FC<{
  onSubmit: (data: ProjectFormData[]) => void;
  defaultValues?: ProjectFormData[];
}> = ({ onSubmit, defaultValues = [] }) => {
  const { control, handleSubmit } = useForm({
    defaultValues: { projects: defaultValues }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects'
  });

  const addProject = () => {
    append({
      title: '',
      description: '',
      technologies: [],
      liveUrl: '',
      githubUrl: '',
      images: [],
      category: '',
      status: 'completed',
      featured: false
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Projects Portfolio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit(data.projects))} className="space-y-6">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="font-medium">Project #{index + 1}</h4>
                  <div className="flex items-center gap-2">
                    <Controller
                      control={control}
                      name={`projects.${index}.featured`}
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <Label className="text-sm">Featured</Label>
                        </div>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Title *</Label>
                      <Controller
                        control={control}
                        name={`projects.${index}.title`}
                        rules={{ required: 'Project title is required' }}
                        render={({ field, fieldState }) => (
                          <>
                            <Input {...field} placeholder="My Awesome Project" />
                            {fieldState.error && (
                              <p className="text-sm text-destructive">{fieldState.error.message}</p>
                            )}
                          </>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Controller
                        control={control}
                        name={`projects.${index}.category`}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROJECT_CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Controller
                      control={control}
                      name={`projects.${index}.description`}
                      rules={{ required: 'Description is required', minLength: { value: 10, message: 'Description must be at least 10 characters' } }}
                      render={({ field, fieldState }) => (
                        <>
                          <Textarea
                            {...field}
                            placeholder="Describe your project, its purpose, and key features..."
                            className="min-h-20"
                          />
                          {fieldState.error && (
                            <p className="text-sm text-destructive">{fieldState.error.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Technologies Used *</Label>
                    <Controller
                      control={control}
                      name={`projects.${index}.technologies`}
                      rules={{ required: 'At least one technology is required' }}
                      render={({ field, fieldState }) => (
                        <>
                          <Input
                            placeholder="React, TypeScript, Node.js (comma separated)"
                            value={field.value?.join(', ') || ''}
                            onChange={(e) => {
                              const technologies = e.target.value
                                .split(',')
                                .map(tech => tech.trim())
                                .filter(tech => tech.length > 0);
                              field.onChange(technologies);
                            }}
                          />
                          <div className="flex flex-wrap gap-1 mt-2">
                            {field.value?.map((tech, techIndex) => (
                              <Badge key={techIndex} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          {fieldState.error && (
                            <p className="text-sm text-destructive">{fieldState.error.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Live URL</Label>
                      <Controller
                        control={control}
                        name={`projects.${index}.liveUrl`}
                        render={({ field }) => (
                          <Input {...field} placeholder="https://myproject.com" />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>GitHub URL</Label>
                      <Controller
                        control={control}
                        name={`projects.${index}.githubUrl`}
                        render={({ field }) => (
                          <Input {...field} placeholder="https://github.com/user/project" />
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Controller
                      control={control}
                      name={`projects.${index}.status`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="planned">Planned</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button type="button" onClick={addProject} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>

          <Button type="submit" className="w-full">
            Save Projects
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Main User Information Forms Component
export const UserInformationForms: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    profile: null,
    skills: [],
    projects: [],
    experience: [],
    education: []
  });

  const handleProfileSubmit = useCallback((data: ProfileFormData) => {
    setFormData(prev => ({ ...prev, profile: data }));
    toast.success('Profile information saved successfully!');
  }, []);

  const handleSkillsSubmit = useCallback((data: SkillFormData[]) => {
    setFormData(prev => ({ ...prev, skills: data }));
    toast.success('Skills saved successfully!');
  }, []);

  const handleProjectsSubmit = useCallback((data: ProjectFormData[]) => {
    setFormData(prev => ({ ...prev, projects: data }));
    toast.success('Projects saved successfully!');
  }, []);

  const saveAllData = useCallback(async () => {
    try {
      // Here you would implement the actual API call to save all data
      console.log('Saving all form data:', formData);
      toast.success('All information saved successfully!');
    } catch (error) {
      toast.error('Failed to save information');
    }
  }, [formData]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Portfolio Information</h1>
        <p className="text-muted-foreground">
          Complete your portfolio by filling out the information below
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Projects</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileForm onSubmit={handleProfileSubmit} />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <SkillsForm onSubmit={handleSkillsSubmit} />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsForm onSubmit={handleProjectsSubmit} />
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Experience form component will be implemented here with similar structure to other forms.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Education form component will be implemented here with similar structure to other forms.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save All Button */}
      <div className="flex justify-center pt-6">
        <Button onClick={saveAllData} size="lg" className="px-8">
          Save All Information
        </Button>
      </div>
    </div>
  );
};

export default UserInformationForms;