import {repository} from '@loopback/repository';
import {SocialProjectRepository} from '../repositories';
import {del, get, patch, post, param, requestBody} from '@loopback/rest';
import {SocialProject, NewSocialProject} from '../models';
import {authenticate} from '@loopback/authentication';

export class FacultySocialProjectController {
  constructor(
    @repository(SocialProjectRepository)
    protected socialRepo: SocialProjectRepository,
  ) {}

  @get('/faculties/{language}/{name}/social-projects', {
    responses: {
      '200': {
        description: 'Array of Social Projects from a Faculty',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': SocialProject}},
          },
        },
      },
    },
  })
  async findFacultyProjects(
    @param.path.string('name') name: string,
    @param.path.string('language') language: string,
    @param.query.string('id') id?: string,
  ): Promise<SocialProject[]> {
    return await this.socialRepo.find({
      where: {language: language, faculty: name, id: id},
      order: ['id DESC'],
    });
  }

  @authenticate('JWTStrategy')
  @patch('/faculties/{language}/{name}/social-projects', {
    responses: {
      '200': {
        description: 'Faculty.SocialProject PATCH success',
      },
    },
  })
  async patchSocialProject(
    @param.path.string('language') language: string,
    @param.path.string('name') name: string,
    @requestBody() socialProject: Partial<SocialProject>,
    @param.query.string('id') id?: string,
  ): Promise<SocialProject> {
    socialProject.active =
      !socialProject.end_date || new Date(socialProject.end_date) < new Date();
    await this.socialRepo.updateById(id, socialProject);
    return this.socialRepo.findById(id);
  }

  @get('/faculties/{language}/{name}/social-projects-short', {
    responses: {
      '200': {
        description: 'Array of Social Projects from a Faculty',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': SocialProject}},
          },
        },
      },
    },
  })
  async findFacultyProjectsShort(
    @param.path.string('name') name: string,
    @param.path.string('language') language: string,
    @param.query.string('q') searchQuery?: string,
  ): Promise<SocialProject[]> {
    return await this.socialRepo
      .find({
        where: {language: language, faculty: name},
        fields: {id: true, title: true, short_description: true, images: true},
        order: ['id DESC'],
      })
      .then(projects => {
        if (!searchQuery) return projects;
        let pattern = new RegExp('.*' + searchQuery + '.*', 'i');
        return projects.filter(
          project =>
            pattern.test(project.title || '') ||
            pattern.test(project.short_description || ''),
        );
      });
  }

  @authenticate('JWTStrategy')
  @post('/faculties/{name}/social-projects', {
    responses: {
      '200': {
        description: 'Faculty.SocialProject instance',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': SocialProject}},
          },
        },
      },
    },
  })
  async createSocialProject(
    @param.path.string('name') name: string,
    @requestBody() socialProject: NewSocialProject,
  ): Promise<SocialProject[]> {
    //New project, english version
    let newProjectEN = new SocialProject({
      title: socialProject.titleEN,
      short_description: socialProject.descriptionEN,
      content: socialProject.contentEN,
      images: socialProject.images,
      start_date: socialProject.startDate,
      end_date: socialProject.endDate,
      faculty: name,
      language: 'en',
      active:
        !socialProject.endDate || new Date(socialProject.endDate) > new Date(),
    });

    //New project, portuguese version
    let newProjectPT = new SocialProject({
      title: socialProject.titlePT,
      short_description: socialProject.descriptionPT,
      content: socialProject.contentPT,
      images: socialProject.images,
      start_date: socialProject.startDate,
      end_date: socialProject.endDate,
      faculty: name,
      language: 'pt',
      active:
        !socialProject.endDate || new Date(socialProject.endDate) > new Date(),
    });

    return [
      await this.socialRepo.create(newProjectEN),
      await this.socialRepo.create(newProjectPT),
    ];
  }

  @authenticate('JWTStrategy')
  @del('/faculties/social-projects', {
    responses: {
      '204': {
        description: 'Faculty.SocialProject DELETE success',
      },
    },
  })
  async deleteSocialProject(
    @param.query.string('id') id?: string,
  ): Promise<void> {
    await this.socialRepo.deleteById(id);
  }
}
