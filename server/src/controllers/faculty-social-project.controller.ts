import {
    Count,
    CountSchema,
    repository,
    Filter,
    Where,
  } from '@loopback/repository';
  import {FacultyRepository} from '../repositories';
  import {
    get,
    patch,
    param,
    requestBody,
    getWhereSchemaFor,
  } from '@loopback/rest';
  import {SocialProject, Faculty} from '../models';
  
  export class FacultySocialProjectController {
    constructor(
      @repository(FacultyRepository) protected facultyRepo: FacultyRepository,
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
      @param.query.string('filter') filter?: Filter,
    ): Promise<SocialProject[]> {
      let id = 0;
      await this.facultyRepo
        .findOne({
          where: {name: name, language: language},
          fields: {id: true},
        })
        .then(function(result) {
          if (result != null) id = result.id;
        })
        .catch(function(err) {});
      return await this.facultyRepo.socialProjects(id).find(filter);
    }
  
    @patch('/faculties/{language}/{name}/social-projects', {
      responses: {
        '200': {
          description: 'Faculty.SocialProject PATCH success count',
          content: {'application/json': {schema: CountSchema}},
        },
      },
    })
    async patch(
      @param.path.string('language') language: string,
      @param.path.string('name') name: string,
      @requestBody() socialProject: Partial<SocialProject>,
      @param.query.object('where', getWhereSchemaFor(SocialProject))
      where?: Where,
    ): Promise<Count> {
      let id = 0;
      await this.facultyRepo
        .findOne({
          where: {name: name, language: language},
          fields: {id: true},
        })
        .then(function(result) {
          if (result != null) id = result.id;
        })
        .catch(function(err) {});
        
      return await this.facultyRepo
        .socialProjects(id)
        .patch(socialProject, where);
    }
  }
  