"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  contact: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  experienceItem: {
    marginBottom: 15,
    paddingLeft: 15,
    borderLeft: '3 solid #2563eb',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  itemCompany: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  itemDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  itemDescription: {
    fontSize: 10,
    color: '#4b5563',
    marginTop: 3,
    lineHeight: 1.4,
  },
  educationItem: {
    marginBottom: 15,
    paddingLeft: 15,
    borderLeft: '3 solid #2563eb',
  },
  projectItem: {
    marginBottom: 15,
    paddingLeft: 15,
    borderLeft: '3 solid #2563eb',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    backgroundColor: '#f3f4f6',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    marginBottom: 4,
  },
  summary: {
    fontSize: 11,
    color: '#4b5563',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
    borderLeft: '4 solid #2563eb',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
});

interface ResumePDFProps {
  resumeData: {
    personalInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      location: string;
      summary: string;
    };
    experience: Array<{
      id: string;
      title: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
    }>;
    education: Array<{
      id: string;
      degree: string;
      institution: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      gpa?: string;
      description: string;
    }>;
    skills: Array<{
      id: string;
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    projects: Array<{
      id: string;
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      startDate: string;
      endDate: string;
      current: boolean;
    }>;
  };
  title: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const ResumePDFDocument = ({ resumeData, title }: ResumePDFProps) => {
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Text>
          <Text style={styles.contact}>
            {personalInfo.email} | {personalInfo.phone || ''} | {personalInfo.location || ''}
          </Text>
        </View>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Professional Experience */}
        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp, index) => (
              <View key={exp.id || `exp-${index}`} style={styles.experienceItem}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{exp.title}</Text>
                    <Text style={styles.itemCompany}>{exp.company}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={edu.id || `edu-${index}`} style={styles.educationItem}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{edu.degree}</Text>
                    <Text style={styles.itemCompany}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={styles.itemDescription}>GPA: {edu.gpa}</Text>
                )}
                {edu.description && (
                  <Text style={styles.itemDescription}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {skills.map((skill, index) => (
                <Text key={skill.id || `skill-${index}`} style={styles.skillItem}>
                  {skill.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project, index) => (
              <View key={project.id || `project-${index}`} style={styles.projectItem}>
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={styles.itemTitle}>{project.name}</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatDate(project.startDate)} - {project.current ? 'Present' : formatDate(project.endDate)}
                  </Text>
                </View>
                {project.description && (
                  <Text style={styles.itemDescription}>{project.description}</Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.itemDescription}>
                    <Text style={{ fontWeight: 'bold' }}>Technologies: </Text>
                    {project.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export default ResumePDFDocument;
