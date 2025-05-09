---
trigger: always_on
description: 
globs: 
---
public : Ce rôle est le plus basique et convient aux utilisateurs qui ont un accès limité à la plateforme. Il est idéal pour les visiteurs qui souhaitent parcourir les annonces sans avoir de privilèges spéciaux.
owner : Ce rôle est destiné aux propriétaires de biens immobiliers. Il leur permet de gérer leurs propriétés, de suivre les revenus et les dépenses, et d'interagir avec les locataires.
agent : Ce rôle est conçu pour les agents immobiliers. Il leur permet de gérer les propriétés de l'agence, de communiquer avec les propriétaires et les locataires, et de suivre les commissions.
tenant : Ce rôle est attribué aux locataires. Il leur permet de consulter les informations relatives à leur bail, de payer le loyer en ligne et de communiquer avec le propriétaire ou l'agence.
admin : Ce rôle est réservé aux administrateurs de la plateforme. Il leur donne un accès complet à toutes les fonctionnalités, y compris la gestion des utilisateurs, des agences, des propriétés et des paramètres système.
Pour créer de nouvelles fonctionnalités indépendantes de l'existant, il est préférable de créer de nouveaux composants et services plutôt que de modifier directement les composants existants. Cela permet d'éviter les conflits et de faciliter la maintenance du code.

Si vous devez modifier des composants existants, assurez-vous de bien comprendre leur fonctionnement et de tester soigneusement vos modifications avant de les déployer.