import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowDefinitionEntity } from './entities/workflow-definition.entity';
import { WorkflowDefinitionStepEntity } from './entities/workflow-definition-step.entity';
import { WorkflowInstanceEntity } from './entities/workflow-instance.entity';
import { WorkflowInstanceStepEntity } from './entities/workflow-instance-step.entity';
import { EntityReferenceTypeEntity } from '../evidences/entities/entity-reference-type.entity';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkflowDefinitionEntity,
      WorkflowDefinitionStepEntity,
      WorkflowInstanceEntity,
      WorkflowInstanceStepEntity,
      EntityReferenceTypeEntity,
    ]),
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService],
  exports: [TypeOrmModule, WorkflowsService],
})
export class WorkflowsModule {}
